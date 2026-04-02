import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { notifyRole } from '../services/notificationService.js'
import { startDriverSearch } from '../utils/fulfillment.js'
import { upload, uploadToCloudinary } from '../utils/cloudinary.js'
import { getOrder, markMessagesAsRead } from '../services/orderService.js'

const router = express.Router()

router.put('/mark-read/:id', authMiddleWare, async (req, res) => {
    const orderId = req.params.id;
    const role = req.query.role;

    try {
        await markMessagesAsRead(orderId, role);
        return res.status(200).json({ message: 'Marked as read' });
    } catch (err) {
        console.error('Mark Read Error:', err);
        return res.status(500).json({ message: 'Database error' });
    }
});

router.get('/chat/:id', authMiddleWare, async (req, res) => {

    const orderId = req.params.id
    const userId = req.userId

    const order = await getOrder(orderId)
    if (!order) {
        return res.status(404).json({ message: 'order not found' })
    }

    if (Number(userId) != order.user_id && Number(userId) != order.driver_id) {
        return res.status(404).json({ message: 'unauthorized' })
    }

    const getMessages = `
    SELECT * 
    FROM messages
    WHERE order_id=?
    ORDER BY timestamp_message 
    `

    try {
        const [result] = await db.query(getMessages, [orderId])
        return res.status(200).json(result)
    }
    catch (err) {
        console.error('Fetch Messages Error:', err);
        return res.status(500).json({ message: 'Database error' })
    }

})


export default router