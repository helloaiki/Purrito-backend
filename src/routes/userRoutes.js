import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

//GET /api/user/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const userId = req.userId;
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

//PUT /api/user/profile - update name and phone
router.put('/profile', authMiddleWare, async (req, res) => {
    const userId = req.userId;
    const { user_name, phone_number } = req.body;
    try {
        const updateProfile = `UPDATE user SET user_name = ?, phone_number = ? WHERE user_id = ?`;
        await db.execute(updateProfile, [user_name, phone_number, userId]);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// DELETE /api/user/deleteaccount
router.delete('/deleteaccount', authMiddleWare, async (req, res) => {
    const userId = req.userId
    try {
        const [result] = await db.execute(
            'DELETE FROM user WHERE user_id = ?',
            [userId]
        )
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.status(200).json({ message: 'Account deleted successfully' })
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error deleting account' })
    }
});

//Menu Routes
// GET /api/user/menu
router.get('/menu', async (req, res) => {
    try {
        const [menuItems] = await db.execute(`
                SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                    rm.price, rm.food_image_path, rm.is_available,
                    rm.quantity_sold, rm.discount_percent,
                    r.res_name, r.restaurant_type, r.city,
                    (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating
                FROM Restaurant_Menu rm
                JOIN restaurant r ON rm.res_id = r.restaurant_id
                WHERE rm.is_available = 1
                ORDER BY rm.quantity_sold DESC
            `)
        res.status(200).json(menuItems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching menu' })
    }
});

// GET /api/user/menu/trending  — top 10 foods by quantity_sold
router.get('/menu/trending', async (req, res) => {
    try {
        const getTrendMenu = `
            SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                rm.price, rm.food_image_path, rm.quantity_sold,
                r.res_name,
                (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating
            FROM Restaurant_Menu rm
            JOIN restaurant r ON rm.res_id = r.restaurant_id
            WHERE rm.is_available = 1
            ORDER BY rm.quantity_sold DESC
            LIMIT 10
        `;
        const [rows] = await db.execute(getTrendMenu);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching trending menu' })
    }
});

// GET /api/user/menu/offers — foods with a discount
router.get('/menu/offers', async (req, res) => {
    try {
        const getOfferMenu = `
            SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                rm.price, rm.food_image_path, rm.discount_percent,
                r.res_name,
                (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating
            FROM Restaurant_Menu rm
            JOIN restaurant r ON rm.res_id = r.restaurant_id
            WHERE rm.discount_percent > 0 AND rm.is_available = 1
            ORDER BY rm.discount_percent DESC
            LIMIT 10
        `;
        const [rows] = await db.execute(getOfferMenu);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching offers' })
    }
});

// GET /api/user/menu/similar/:food_id
router.get('/menu/similiar/:food_id', async (req, res) => {
    const { food_id } = req.params;
    try {
        const [target] = await db.execute(
            `SELECT course_name, res_id FROM Restaurant_Menu WHERE food_id=?`,
            [food_id]
        )
        if (target.length === 0) return res.status(200).json([])

        const { course_name, res_id } = target[0];

        const [rows] = await db.execute(`
                SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                   rm.price, rm.food_image_path,
                   r.res_name
                FROM Restaurant_Menu rm
                JOIN restaurant r ON rm.res_id = r.restaurant_id
                WHERE rm.course_name=?
                    AND rm.res_id!=?
                    AND rm.food_id !=?
                    AND rm.is_available = 1
                ORDER BY rm.quantity_sold DESC
                LIMIT 10
            `, [course_name, res_id, food_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching similar foods' })
    }
});

// GET /api/user/menu/:food_id  — single food item detail
router.get('/menu/:food_id', async (req, res) => {
    const { food_id } = req.params;
    try {
        const [rows] = await db.execute(`
                SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                   rm.price, rm.food_image_path, rm.is_available,
                   r.res_name, r.restaurant_type, r.city,
                   r.description AS res_description,
                   (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating
                FROM Restaurant_Menu rm
                JOIN restaurant r ON rm.res_id = r.restaurant_id
                WHERE rm.food_id=?
                    AND rm.is_available = 1
            `, [food_id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Food item not found' });
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching food item' })
    }
});

// GET /api/user/menu/restaurant/:res_id - All items from ONE restaurant
router.get('/menu/restaurant/:res_id', async (req, res) => {
    const { res_id } = req.params;
    try {
        const [rows] = await db.execute(`
                SELECT rm.food_id, rm.res_id, rm.name, rm.course_name,
                   rm.price, rm.food_image_path,
                   r.res_name, r.res_image_path AS restaurant_image, r.city, r.street,
                   (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating
                FROM Restaurant_Menu rm
                JOIN restaurant r ON rm.res_id = r.restaurant_id
                WHERE rm.res_id=?
                    AND rm.is_available = 1
                ORDER BY rm.quantity_sold DESC
                LIMIT 12
            `, [res_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching restaurant menu' })
    }
});

// GET /api/user/restaurants
router.get('/restaurants', async (req, res) => {
    try {
        const [rows] = await db.execute(`
                SELECT r.restaurant_id, r.res_name, r.restaurant_type,
                    r.city, r.res_image_path,
                    (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating,
                    COUNT(o.order_id) AS order_count
                FROM restaurant r
                LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
                GROUP BY r.restaurant_id
                ORDER BY order_count DESC
        `)
        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching all restaurants' })
    }
})

// GET /api/user/restaurants/trending
router.get('/restaurants/trending', async (req, res) => {
    try {
        const [rows] = await db.execute(`
                SELECT r.restaurant_id, r.res_name, r.restaurant_type,
                    r.city, r.res_image_path,
                    (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = r.restaurant_id) AS rating,
                    COUNT(o.order_id) AS order_count
                FROM restaurant r
                LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
                GROUP BY r.restaurant_id
                ORDER BY order_count DESC
                LIMIT 8
        `)
        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching trending restaurants' })
    }
})

// GET /api/user/restaurants/:res_id
router.get('/restaurants/:res_id', async (req, res) => {
    const { res_id } = req.params;
    try {
        const [rows] = await db.execute(`
                SELECT restaurant_id, res_name, restaurant_type,
                    city, street, res_image_path,
                    (SELECT IFNULL(ROUND(AVG(rating), 1), 4.5) FROM rating_restaurant WHERE res_id = restaurant_id) AS rating
                FROM restaurant
                WHERE restaurant_id = ?
        `, [res_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Restaurant not found' });
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching restaurant details' });
    }
});

//Order Routes

//GET /api/user/orders — user's full order history
router.get('/orders', authMiddleWare, async (req, res) => {
    const userId = req.userId;
    try {
        const getOrders = `
            SELECT o.order_id, o.price, o.status AS order_status, o.created_at, o.delivery_address, o.payment_method,
               r.res_name
            FROM orders o
            JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `;
        const [orders] = await db.execute(getOrders, [userId]);
        res.status(200).json(orders);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// POST /api/user/orders  — place a new order
router.post('/orders', authMiddleWare, async (req, res) => {
    const userId = req.userId;
    const { items, delivery_address, delivery_lat, delivery_lng, payment_method, coupon_code } = req.body;

    if (items.length === 0) return res.status(400).json({ message: 'No items in the order' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [firstFood] = await conn.execute(
            `SELECT res_id FROM Restaurant_Menu WHERE food_id=?`,
            [items[0].food_id]
        );

        if (firstFood.length === 0) return res.status(404).json({ message: 'Food item not found' });

        const restaurant_id = firstFood[0].res_id

        let subtotal = 0
        for (const item of items) {
            const [foodRow] = await conn.execute(
                `SELECT price FROM Restaurant_Menu WHERE food_id=?`,
                [item.food_id]
            );
            if (foodRow.length === 0) throw new Error('Food item ${item.food_id} not found');
            subtotal += parseFloat(foodRow[0].price) * item.quantity;
        }

        let discount = 0
        if (coupon_code) {
            const [coupon] = await conn.execute(
                `SELECT discount_percent, min_order_value FROM coupon
                WHERE coupon_code = ? AND is_active = 1 AND expiry_date >= CURDATE()`,
                [coupon_code]
            );
            if (coupon.length > 0 && subtotal >= parseFloat(coupon[0].min_order_value)) {
                discount = subtotal * parseFloat(coupon[0].discount_percent) / 100;
            }
        }

        const deliveryFee = 50;
        const finalPrice = subtotal - discount + deliveryFee;

        const [orderResult] = await conn.execute(
            `INSERT INTO orders (user_id, restaurant_id, price, delivery_address, delivery_lat, delivery_lng, payment_method, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'WAITING')`,
            [userId, restaurant_id, finalPrice.toFixed(2), delivery_address, delivery_lat, delivery_lng, payment_method]
        )

        const order_id = orderResult.insertId;

        for (const item of items) {
            await conn.execute(
                `INSERT INTO order_items (order_id, food_id, quantity) VALUES (?, ?, ?)`,
                [order_id, item.food_id, item.quantity]
            )
            await conn.execute(
                `UPDATE Restaurant_Menu SET quantity_sold = quantity_sold + ? WHERE food_id=?`,
                [item.quantity, item.food_id]
            )
        }

        await conn.commit();
        res.status(201).json({ message: 'Order placed successfully', order_id })

    } catch (error) {
        await conn.rollback();
        console.error(error)
        res.status(500).json({ message: 'Error placing order' })
    } finally {
        conn.release();
    }

});

// GET /api/user/orders/:order_id  — order detail for tracking page
router.get('/orders/:order_id', authMiddleWare, async (req, res) => {
    const { order_id } = req.params;
    const userId = req.userId;
    try {
        const getOrders = `
            SELECT o.order_id, o.price, o.status, o.delivery_address, o.payment_method,
               o.rejection_reason, o.created_at,
               r.res_name
            FROM orders o
            JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            WHERE o.order_id = ? AND o.user_id= ?
        `;
        const [orders] = await db.execute(getOrders, [order_id, userId]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

        const [items] = await db.execute(`
            SELECT oi.food_id, oi.quantity, rm.name, rm.price, rm.food_image_path
            FROM order_items oi
            JOIN Restaurant_Menu rm ON oi.food_id = rm.food_id
            WHERE oi.order_id = ?
        `, [order_id]);

        res.status(200).json({ ...orders[0], items });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// POST /api/user/orders/:order_id/rate  — rate restaurant after delivery
router.post('/orders/:order_id/rate', authMiddleWare, async (req, res) => {
    const { order_id } = req.params
    const userId = req.userId
    const { rating } = req.body

    try {
        const [order] = await db.execute(
            `SELECT restaurant_id FROM orders WHERE order_id = ? AND user_id=?`,
            [order_id, userId]
        )
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

        await db.execute(
            `INSERT INTO rating_restaurant (user_id, res_id, order_id, rating)
            VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, order[0].restaurant_id, order_id, rating]
        )
        res.status(200).json({ message: 'Restaurant rating saved' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error saving restaurant rating' })
    }
});

// POST /api/user/orders/:order_id/ratedriver
router.post('/orders/:order_id/ratedriver', authMiddleWare, async (req, res) => {
    const { order_id } = req.params
    const userId = req.userId
    const { rating } = req.body
    try {
        const [order] = await db.execute(
            `SELECT driver_id FROM orders WHERE order_id = ? AND user_id=?`,
            [order_id, userId]
        )
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
        if (!order[0].driver_id) return res.status(400).json({ message: 'No driver assigned to this order' });

        await db.execute(
            `INSERT INTO rating_driver (user_id, driver_id, order_id, rating)
            VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, order[0].driver_id, order_id, rating]
        )
        res.status(200).json({ message: 'Driver rating saved' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error saving driver rating' })
    }
})

//Coupon Route

// POST /api/user/coupons/validate  — validate coupon
router.post('/coupon/validate', authMiddleWare, async (req, res) => {
    const { coupon_code, order_total } = req.body
    try {
        const [coupons] = await db.execute(
            `SELECT coupon_code, discount_percent, min_order_value FROM coupon
            WHERE coupon_code = ? AND is_active = 1 AND expiry_date >= CURDATE()`,
            [coupon_code]
        )
        if (coupons.length === 0) return res.status(404).json({ message: 'Invalid or expired coupon' });

        const coupon = coupons[0]

        if (order_total < parseFloat(coupon.min_order_value)) return res.status(400).json({ message: 'Order total is less than minimum order value' });

        const discount = parseFloat((order_total * parseFloat(coupon.discount_percent) / 100).toFixed(2))

        res.status(200).json({
            coupon_code,
            discount_percent: coupon.discount_percent,
            discount,
            message: `Coupon applied! ${coupon.discount_percent}% off`
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error validating coupon' })
    }
})

export default router
