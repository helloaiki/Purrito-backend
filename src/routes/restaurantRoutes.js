import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/restaurant/menu
router.get('/menu', async (req, res) => {
    try {
        const getMenu = `
            SELECT rm.*, r.res_name
            FROM Restaurant_Menu rm
            JOIN restaurant r ON rm.res_id = r.restaurant_id
            WHERE rm.is_available = 1
        `
        const [menuItems] = await db.execute(getMenu)
        res.status(200).json(menuItems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching menu' })
    }
});

// GET /api/restaurant/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const resId = req.user.restaurantId || req.user.id;
    try {
        const getRes = `
            SELECT restaurant_id, res_name, email_address, street, city, postal_code, 
                   building_name, food_program, res_image_path, total_sales, description, restaurant_type 
            FROM restaurant WHERE restaurant_id = ?`;
        const [restaurant] = await db.execute(getRes, [resId]);
        if (restaurant.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json(restaurant[0]);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// POST /api/restaurant/leftover
router.post('/leftover', authMiddleWare, async (req, res) => {
    const { food_id, made_on, quantity } = req.body;
    const resId = req.user.restaurantId || req.user.id;
    const qty = quantity || 1;

    try {
        const insertLeftover = `INSERT INTO leftover_available (res_id, food_id, made_on, quantity) VALUES (?,?,?,?)`;
        await db.execute(insertLeftover, [resId, food_id, made_on, qty]);
        res.status(200).json({ message: 'Leftover added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding leftover' });
    }
});

export default router