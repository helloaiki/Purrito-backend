import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { redisClient, clients } from '../server.js'
import WebSocket, { WebSocketServer } from 'ws'


const router = express.Router()

router.post('/location', async (req, res) => {
    const { driverId, orderId, lat, long } = req.body
    if (!driverId || !orderId || !lat || !long) {
        return res.status(400).json({ message: 'Missing parameters' })
    }
    const key = `driver:${driverId}:location`
    const value = JSON.stringify({ orderId, lat, long, updatedAt: Date.now() })
    try {
        await redisClient.set(key, value, { EX: 15 })
    }
    catch (err) {
        return res.status(400).json({ message: err.message })
    }
    if (clients[orderId]) {
        clients[orderId].forEach((ws) => {
            if (ws.readyState == WebSocket.OPEN) {
                ws.send(value)
            }
        })
    }

    return res.status(200).json({ message: 'OK' })
})

router.get('/profile', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    try {
        const getDriverProfileInfo = `SELECT * FROM driver WHERE driver_id=?`
        const [result] = await db.query(getDriverProfileInfo, [driverId])
        if (result.length == 0) {
            return res.status(401).json({ message: 'No user corresponding to this id' })//should never happen atp but still kept it
        }

        return res.status(200).json(result[0])
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

router.put('/profile', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    const { user_name, phone_number } = req.body
    console.log(`PUT /profile request for driver ${driverId}`, { user_name, phone_number });

    if (!user_name && !phone_number) {
        return res.status(400).json({ message: 'Please provide at least one field to update' })
    }
    try {
        const updateProfile = `
            UPDATE driver 
            SET user_name = COALESCE(?, user_name),
            phone_number = COALESCE(?, phone_number)
            WHERE driver_id = ?
        `
        const [result] = await db.execute(updateProfile, [user_name || null, phone_number || null, driverId])
        console.log('Update result:', result);

        if (result.affectedRows == 0) {
            return res.status(401).json({ message: 'Driver not found' })
        }
        return res.status(200).json({ message: 'Profile updated successfully' })
    }
    catch (err) {
        console.error('Error updating driver profile:', err);
        return res.status(503).json({ message: err.message })
    }
})

router.delete('/deleteaccount', authMiddleWare, async (req, res) => {

    const driverId = req.userId
    try {
        const deleteDriver = `DELETE FROM driver WHERE driver_id=?`
        const [result] = await db.execute(deleteDriver, [driverId])
        if (result.affectedRows == 0) {
            return res.status(401).json({ message: 'No user of this id was found' })
        }

        return res.status(200).json({ message: 'Driver successfully deleted' })
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})


router.get('/totalrevenue', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    try {
        const getTotalRevenue = `SELECT ROUND(SUM(payment),2) AS totalIncome FROM driver_income WHERE driver_id=? AND has_delivered=1`
        const [result] = await db.query(getTotalRevenue, [driverId])
        if (result.length == 0) {
            return res.status(401).json({ message: 'Error in retrieving' })//should never run 
        }

        return res.status(200).json(result[0])
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

router.get('/revenueparticulartime', authMiddleWare, async (req, res) => {
    const { monthReq, yearReq } = req.query
    const driverId = req.userId
    try {
        const getRevenueBasedOnParticularTime = `
            SELECT ROUND(SUM(payment)) AS revenue
            FROM driver_income 
            WHERE driver_id=? AND YEAR(payment_date)=? AND MONTH(payment_date)=? AND has_delivered=1
        `
        const [result] = await db.query(getRevenueBasedOnParticularTime, [driverId, yearReq, monthReq])
        const revenue = result[0].revenue || 0;

        return res.status(200).json({ revenue })

    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})


router.get('/ordersavailable', authMiddleWare, async (req, res) => {
    try {
        const getAvailableOrders = `
            SELECT order_id,restaurant_id
            FROM orders
            WHERE status='PLACED' AND driver_id IS NULL
        `
        const [result] = await db.query(getAvailableOrders)

        return res.status(200).json(result)
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})





router.get('/stats', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    try {
        const statsQuery = `
            SELECT 
                (SELECT ROUND(SUM(payment), 2) FROM driver_income WHERE driver_id = ? AND has_delivered = 1) AS totalRevenue,
                (SELECT COUNT(*) FROM orders WHERE driver_id = ? AND status = 'DELIVERED') AS totalDeliveries,
                (SELECT ROUND(AVG(rating), 1) FROM rating_driver WHERE driver_id = ?) AS rating,
                (SELECT ROUND(SUM(payment), 2) FROM driver_income WHERE driver_id = ? AND has_delivered = 1 AND DATE(payment_date) = CURDATE()) AS todayEarnings
        `
        const [result] = await db.query(statsQuery, [driverId, driverId, driverId, driverId])

        const historyQuery = `
            SELECT 
                DATE_FORMAT(payment_date, '%a') as day,
                ROUND(SUM(payment), 2) as dailyRevenue
            FROM driver_income
            WHERE driver_id = ? AND has_delivered = 1 AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(payment_date)
            ORDER BY DATE(payment_date) ASC
        `
        const [history] = await db.query(historyQuery, [driverId])

        const stats = {
            totalRevenue: result[0].totalRevenue || 0,
            totalDeliveries: result[0].totalDeliveries || 0,
            rating: result[0].rating || 0,
            todayEarnings: result[0].todayEarnings || 0,
            history: history
        }

        return res.status(200).json(stats)
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

router.get('/orderinformation', authMiddleWare, async (req, res) => {
    try {
        const { orderId } = req.query
        const getOrderInfo = `
            SELECT R.res_name AS restaurant_name,R.res_image_path AS restaurant_image,R.street,R.city,R.postal_code,R.building_name,O.delivery_address,O.delivery_lat,O.delivery_lng, O.status
            FROM restaurant R
            JOIN orders O on R.restaurant_id=O.restaurant_id AND order_id=?
        `
        const [result] = await db.query(getOrderInfo, [orderId])
        if (result.length == 0) {
            return res.status(401).json({ message: 'There is no order with that information' })
        }

        return res.status(200).json(result[0])
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

router.put('/acceptOrder', authMiddleWare, async (req, res) => {
    const { orderId } = req.body
    const driverId = req.userId
    try {
        const acceptOrderAsDriver = `
        UPDATE orders
        SET driver_id=?
        WHERE status='PLACED' AND driver_id IS NULL AND order_id=?
        `
        const [result] = await db.execute(acceptOrderAsDriver, [driverId, orderId])
        if (result.affectedRows == 0) {
            return res.status(409).json({ message: 'Error in assigning you as driver' })
        }

        return res.status(200).json({ message: 'Successfully appointed as driver' })
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

router.put('/updateOrderStatus', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    const { orderId, status } = req.body
    try {
        const getCurrentStatus = `
        SELECT status FROM orders WHERE order_id=? AND driver_id=?
        `
        const [currentStat] = await db.query(getCurrentStatus, [orderId, driverId])
        if (currentStat.length == 0) {
            return res.status(404).json({ message: 'Order not found' })
        }
        const currentStatus = currentStat[0].status
        if ((currentStatus == 'WAITING' && status == 'PLACED') || (currentStatus == 'PLACED' && status == 'PREPARING') || (currentStatus == 'PREPARING' && status == 'PICKED_UP') || (currentStatus == 'PICKED_UP' && status == 'DELIVERED')) {
            const updateOrderStatus = `
            UPDATE orders
            SET status=?
            WHERE order_id=? AND driver_id=? AND status=?
            `
            const [result] = await db.execute(updateOrderStatus, [status, orderId, driverId, currentStatus])
            if (result.affectedRows == 0) {
                return res.status(409).json({ message: 'Could not update order status' })
            }

            return res.status(200).json({ message: 'Successfully updated order status' })
        }

        return res.status(400).json({ message: 'Order status could not be changed due to illegal status sequence' })
    }
    catch (err) {
        return res.status(503).json({ message: err.message })
    }
})

export default router


