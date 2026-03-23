import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { redisClient, orderClients, notifyRole } from '../server.js'
import WebSocket, { WebSocketServer } from 'ws'
import { findNextDriver } from '../utils/fulfillment.js'

const router = express.Router()

// Update driver location (Real-time tracking)
router.post('/location', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    const { orderId, lat, long } = req.body

    if (!lat || !long) {
        return res.status(400).json({ message: 'Missing coordinates' })
    }

    const key = `driver:${driverId}:location`
    const value = JSON.stringify({ orderId, lat, long, updatedAt: Date.now() })

    try {
        await redisClient.set(key, value, { EX: 30 })

        await db.execute(
            'UPDATE driver SET lat = ?, lng = ?, last_active = NOW() WHERE driver_id = ?',
            [lat, long, driverId]
        );

        if (orderId && orderClients[orderId]) {
            orderClients[orderId].forEach((ws) => {
                if (ws.readyState == WebSocket.OPEN) {
                    ws.send(value)
                }
            })
        }

    } catch (err) {
        console.error('Error updating driver location:', err);
        return res.status(500).json({ message: err.message })
    }

    return res.status(200).json({ message: 'OK' })
})


// Accept a specific fulfillment offer
router.put('/acceptOffer', authMiddleWare, async (req, res) => {
    const driverId = req.userId;
    const { orderId, notif_id } = req.body;

    try {
        const [log] = await db.execute(
            'SELECT status FROM driver_assignment_logs WHERE order_id = ? AND driver_id = ? AND status = "PENDING"',
            [orderId, driverId]
        );

        if (log.length === 0) {
            return res.status(410).json({ message: 'Offer expired or already handled' });
        }

        // Call the stored procedure
        await db.execute(
            'CALL AssignDriverToOrder(?, ?, ?)',
            [orderId, driverId, notif_id || 0]
        )

        const [order] = await db.query('SELECT user_id, restaurant_id FROM orders WHERE order_id = ?', [orderId]);

        if (order.length > 0) {
            const { user_id, restaurant_id } = order[0];

            const userTitle = "Driver Assigned!";
            const userMessage = `A driver has been assigned to your order #${orderId} and is on the way to the restaurant.`;
            await db.execute(
                'INSERT INTO notifications (user_id, role, title, message, type) VALUES (?, "user", ?, ?, "DRIVER_ASSIGNED")',
                [user_id, userTitle, userMessage]
            );
            notifyRole('user', user_id, { title: userTitle, message: userMessage, type: 'DRIVER_ASSIGNED', order_id: orderId });

            const restaurantTitle = "Driver Assigned!";
            const restaurantMessage = `A driver has been assigned to your order #${orderId} and is on the way to the restaurant.`;
            await db.execute(
                'INSERT INTO notifications (restaurant_id, role, title, message, type) VALUES (?, "restaurant", ?, ?, "DRIVER_ASSIGNED")',
                [restaurant_id, restaurantTitle, restaurantMessage]
            );
            notifyRole('restaurant', restaurant_id, { title: restaurantTitle, message: restaurantMessage, type: 'DRIVER_ASSIGNED', order_id: orderId });

        }

        res.json({ message: 'Order accepted successfully' });

    } catch (err) {
        console.error('Error accepting offer:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Decline a specific fulfillment offer
router.put('/declineOffer', authMiddleWare, async (req, res) => {
    const driverId = req.userId;
    const { orderId, notif_id } = req.body;

    try {
        await db.execute(
            'UPDATE driver_assignment_logs SET status = "DECLINED", responded_at = NOW() WHERE order_id = ? AND driver_id = ?',
            [orderId, driverId]
        );

        if (notif_id) {
            await db.execute('UPDATE notifications SET is_read = TRUE WHERE notif_id = ?', [notif_id]);
        }

        const [orderRows] = await db.execute(
            'SELECT status FROM orders WHERE order_id = ?',
            [orderId]
        );
        const orderStatus = orderRows[0]?.status;
        // Trigger search for next driver
        if (orderRows.length > 0 && ['WAITING', 'PLACED'].includes(orderStatus)) {
            findNextDriver(orderId);
        }

        res.json({ message: 'Offer declined' });
    } catch (err) {
        console.error('Error declining offer:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

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
});

router.get('/stats', authMiddleWare, async (req, res) => {
    const driverId = req.userId
    try {
        const [resultSets] = await db.query('CALL GetDriverDashboardStats(?)', [driverId])

        const summery = resultSets[0][0]
        const history = resultSets[1]

        const stats = {
            totalRevenue: summery?.totalRevenue || 0,
            totalDeliveries: summery?.totalDeliveries || 0,
            rating: summery?.rating || 0,
            todayEarnings: summery?.todayEarnings || 0,
            history: history || []
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
            SELECT R.res_name AS restaurant_name,R.res_image_path AS restaurant_image,R.street,R.city,R.postal_code,R.building_name,R.lat AS restaurant_lat,R.lng AS restaurant_lng, O.delivery_address,O.delivery_lat,O.delivery_lng, O.status
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

// Get the driver's current active order (if any)
router.get('/active-order', authMiddleWare, async (req, res) => {
    const driverId = req.userId;
    try {
        const [rows] = await db.execute(
            `SELECT o.order_id, o.status, r.res_name as restaurant_name, o.delivery_address 
             FROM orders o 
             JOIN restaurant r ON o.restaurant_id = r.restaurant_id
             WHERE o.driver_id = ? AND o.status IN ('PREPARING', 'PICKED_UP', 'PLACED')
             LIMIT 1`,
            [driverId]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'No active order' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/acceptOrder', authMiddleWare, async (req, res) => {
    const { orderId } = req.body
    const driverId = req.userId
    try {
        const acceptOrderAsDriver = `
        UPDATE orders
        SET driver_id=?, status='PREPARING'
        WHERE status IN ('PLACED', 'PREPARING') AND driver_id IS NULL AND order_id=?
        `
        const [result] = await db.execute(acceptOrderAsDriver, [driverId, orderId])
        if (result.affectedRows == 0) {
            return res.status(409).json({ message: 'Order already taken or not available' })
        }

        const [[order1]] = await db.execute(
            'SELECT delivery_fee, user_id FROM orders WHERE order_id=?',
            [orderId]
        );

        await db.execute(
            'INSERT INTO driver_income (order_id, driver_id, payment, payment_date, has_delivered) VALUES (?, ?, ?, CURDATE(), FALSE)',
            [orderId, driverId, order1.delivery_fee]
        );

        await db.execute(
            'INSERT INTO driver_assignment_logs (order_id, driver_id, status, responded_at) VALUES (?,?,?,NOW())',
            [orderId, driverId, 'ACCEPTED']
        );

        const [order] = await db.query('SELECT user_id, restaurant_id FROM orders WHERE order_id = ?', [orderId]);

        if (order.length > 0) {
            const { user_id, restaurant_id } = order[0];

            const userTitle = "Driver Assigned!";
            const userMessage = `A driver has been assigned to your order #${orderId} and is on the way to the restaurant. Your order is being prepared.`;
            await db.execute(
                'INSERT INTO notifications (user_id, role, title, message, type) VALUES (?, "user", ?, ?, "DRIVER_ASSIGNED")',
                [user_id, userTitle, userMessage]
            );
            notifyRole('user', user_id, { title: userTitle, message: userMessage, type: 'DRIVER_ASSIGNED', order_id: orderId });

            const resTitle = "Driver Assigned!";
            const resMessage = `A driver has been assigned to order #${orderId} and is heading to you.`;
            await db.execute(
                'INSERT INTO notifications (restaurant_id, role, title, message, type) VALUES (?, "restaurant", ?, ?, "DRIVER_ASSIGNED")',
                [restaurant_id, resTitle, resMessage]
            );
            notifyRole('restaurant', restaurant_id, { title: resTitle, message: resMessage, type: 'DRIVER_ASSIGNED', order_id: orderId });
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
        SELECT status, user_id FROM orders WHERE order_id=? AND driver_id=?
        `
        const [currentStat] = await db.query(getCurrentStatus, [orderId, driverId])
        if (currentStat.length == 0) {
            return res.status(404).json({ message: 'Order not found' })
        }
        const currentStatus = currentStat[0].status
        const userId = currentStat[0].user_id

        if ((currentStatus == 'PREPARING' && status == 'PICKED_UP') || (currentStatus == 'PICKED_UP' && status == 'DELIVERED')) {
            const updateOrderStatus = `
            UPDATE orders
            SET status=?, payment_status = CASE WHEN ? = 'DELIVERED' THEN 'PAID' ELSE payment_status END
            WHERE order_id=? AND driver_id=? AND status=?
            `
            const [result] = await db.execute(updateOrderStatus, [status, status, orderId, driverId, currentStatus])
            if (result.affectedRows == 0) {
                return res.status(409).json({ message: 'Could not update order status' })
            }

            // Notify user of status change
            let title = "", message = "";
            if (status === 'PICKED_UP') {
                title = "Order Picked Up!";
                message = `Your driver has picked up your order #${orderId} and is on the way!`;
            } else if (status === 'DELIVERED') {
                title = "Order Delivered!";
                message = `Your order #${orderId} has been delivered. Enjoy!`;
            }

            if (title) {
                const [notif] = await db.execute(
                    'INSERT INTO notifications (user_id, role, title, message, type) VALUES (?, "user", ?, ?, "ORDER_STATUS")',
                    [userId, title, message]
                );
                notifyRole('user', userId, { title, message, type: 'ORDER_STATUS', status, order_id: orderId });
            }

            return res.status(200).json({ message: 'Successfully updated order status' })
        }

        return res.status(400).json({ message: 'Order status could not be changed due to illegal status sequence' })
    }
    catch (err) {
        console.error('Error updating status:', err);
        return res.status(503).json({ message: err.message })
    }
})

// GET /driver/ordersavailable - List available orders for drivers to browse
router.get('/ordersavailable', authMiddleWare, async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT 
                o.order_id,
                o.price,
                o.delivery_address,
                o.delivery_fee,
                o.created_at,
                r.res_name AS restaurant_name,
                r.street AS restaurant_street,
                r.city AS restaurant_city,
                (SELECT COUNT(*) FROM order_item oi WHERE oi.order_id = o.order_id) AS item_count
            FROM orders o
            JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            WHERE o.status IN ('PLACED', 'PREPARING') AND o.driver_id IS NULL
            ORDER BY o.created_at ASC
        `);
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching available orders:', err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/order-history', authMiddleWare, async (req, res) => {
    const driverId = req.userId;
    try {
        const [orders] = await db.execute(`
            SELECT o.order_id, o.price, di.payment AS delivery_fee, o.delivery_address, o.status, o.created_at, o.updated_at, r.res_name AS restaurant_name,
                r.city AS restaurant_city, (SELECT COUNT(*) FROM order_item oi WHERE oi.order_id = o.order_id) AS item_count,
                (SELECT IFNULL(AVG(rd.rating), 0)FROM rating_driver rd WHERE rd.order_id = o.order_id) AS rating
            FROM orders o
            JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            JOIN driver_income di ON o.order_id = di.order_id
            WHERE o.driver_id = ? AND o.status = 'DELIVERED'
            ORDER BY o.updated_at DESC
            LIMIT 50
            `, [driverId]);
        res.status(200).json(orders);
    }
    catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ message: err.message });
    }
})

export default router


