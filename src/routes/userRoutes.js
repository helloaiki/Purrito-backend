import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

//GET /api/user/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const userId = req.user.userId || req.user.id;
    try {
        const getUser = `SELECT user_id, user_name, email_address, phone_number FROM user WHERE user_id = ?`;
        const [user] = await db.execute(getUser, [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user[0]);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

//GET /api/user/orders
router.get('/orders', authMiddleWare, async (req, res) => {
    const userId = req.user.userId || req.user.id;
    try {
        const getOrders = `
            SELECT o.order_id, o.price, r.res_name, os.order_status
            FROM order_res_user o
            JOIN restaurant r ON o.res_id = r.restaurant_id
            LEFT JOIN order_state os ON o.order_id = os.order_id
            WHERE o.user_id = ?
            ORDER BY o.order_id DESC
        `;
        const [orders] = await db.execute(getOrders, [userId]);
        res.status(200).json(orders);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

export default router
