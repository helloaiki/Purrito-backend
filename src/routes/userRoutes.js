import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { notifyRole } from '../server.js'
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
                   r.res_name, r.restaurant_type, r.building_name, r.street, r.city,
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

    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in the order' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [firstFood] = await conn.execute(
            `SELECT res_id FROM Restaurant_Menu WHERE food_id=?`,
            [items[0].food_id]
        );

        if (firstFood.length === 0) return res.status(404).json({ message: 'Food item not found' });

        const restaurant_id = firstFood[0].res_id

        let subtotal = 0;
        let restaurant_discount = 0;

        for (const item of items) {
            const [foodRow] = await conn.execute(
                `SELECT price FROM Restaurant_Menu WHERE food_id=?`,
                [item.food_id]
            );
            if (foodRow.length === 0) throw new Error(`Food item ${item.food_id} not found`);

            const price = parseFloat(foodRow[0].price);
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            const [resCoupons] = await conn.execute(
                `SELECT fic.discount_type, fic.discount_value
                 FROM couponed_items ci
                 JOIN food_item_coupon fic ON ci.coupon_id = fic.coupon_id
                 WHERE ci.food_id = ? AND ci.is_active = 1 AND ci.expires_on >= NOW()`,
                [item.food_id]
            );

            if (resCoupons.length > 0) {
                const coupon = resCoupons[0];
                let discountAmount = 0;

                if (coupon.discount_type === 'PERCENT') {
                    discountAmount = itemTotal * (parseFloat(coupon.discount_value) / 100);
                } else if (coupon.discount_type === 'FIXED') {
                    discountAmount = parseFloat(coupon.discount_value) * item.quantity;
                }

                discountAmount = Math.min(discountAmount, itemTotal);
                restaurant_discount += discountAmount;
            }
        }

        const subtotalAfterResDiscount = subtotal - restaurant_discount;
        let website_discount = 0;

        if (coupon_code) {
            const [websiteCoupon] = await conn.execute(
                `SELECT discount_percent, min_order_value FROM coupon
                 WHERE coupon_code = ? AND is_active = 1 AND expiry_date >= CURDATE()`,
                [coupon_code]
            );
            if (websiteCoupon.length > 0 && subtotalAfterResDiscount >= parseFloat(websiteCoupon[0].min_order_value)) {
                website_discount = subtotalAfterResDiscount * (parseFloat(websiteCoupon[0].discount_percent) / 100);
            }
        }

        const deliveryFee = 50;
        const finalPrice = subtotalAfterResDiscount - website_discount + deliveryFee;

        // Execute PlaceOrder stored procedure
        await conn.execute(
            `CALL placeOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, @out_order_id)`,
            [
                userId,
                restaurant_id,
                finalPrice.toFixed(2),
                deliveryFee,
                delivery_address,
                delivery_lat,
                delivery_lng,
                payment_method,
                JSON.stringify(items)
            ]
        );

        const [outRows] = await conn.execute(`SELECT @out_order_id AS order_id`);
        const order_id = outRows[0].order_id;

        await conn.execute(
            'INSERT INTO notifications (restaurant_id, role, title, message, type) VALUES (?,?,?,?,?)',
            [restaurant_id, 'restaurant', 'New Order', `You have a new order #${order_id}. Please accept or reject it.`, 'NEW_ORDER']
        )

        notifyRole('restaurant', restaurant_id, {
            title: 'New Order!',
            message: `You have a new order #${order_id}. Please accept or reject it.`,
            type: 'NEW_ORDER',
            order_id: order_id
        })

        const selectCouponCountIfAny = `
        SELECT coupon_id 
        FROM couponed_items 
        WHERE food_id=?
        `;
        const updateCouponIfAny = `
        UPDATE food_item_coupon
        SET times_used=times_used+?
        WHERE coupon_id=?
        `;

        // Update coupon usage counts if applicable
        for (const item of items) {
            const [coupons] = await conn.query(selectCouponCountIfAny, [item.food_id]);
            for (const c of coupons) {
                await conn.execute(updateCouponIfAny, [item.quantity, c.coupon_id]);
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Order placed successfully', order_id });

    } catch (error) {
        await conn.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order' });
    } finally {
        conn.release();
    }

});

// PUT /api/user/orders/:order_id/cancel — cancel before restaurant accepts
router.put('/orders/:order_id/cancel', authMiddleWare, async (req, res) => {
    console.log('Cancel hit for order:', req.params.order_id, 'user:', req.userId)
    const { order_id } = req.params;
    const userId = req.userId;

    try {
        const [result] = await db.execute(
            `UPDATE orders
            SET status = 'REJECTED', rejection_reason= 'Cancelled by user'
            WHERE order_id = ? AND user_id = ? AND status = 'WAITING'`,
            [order_id, userId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order cannot be cancelled — it may have already been accepted' });

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

// GET /api/user/orders/:order_id  — order detail for tracking page
router.get('/orders/:order_id', authMiddleWare, async (req, res) => {
    const { order_id } = req.params;
    const userId = req.userId;
    try {
        const getOrders = `
            SELECT o.order_id, o.price, o.status, o.delivery_address, o.delivery_lat, o.delivery_lng, o.payment_method,
               o.rejection_reason, o.created_at, o.driver_id,
               r.res_name, r.lat AS res_lat, r.lng AS res_lng,
               d.user_name AS driver_name, d.lat AS driver_lat, d.lng AS driver_lng, d.phone_number AS driver_phone
            FROM orders o
            JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN driver d ON o.driver_id = d.driver_id
            WHERE o.order_id = ? AND o.user_id= ?
        `;
        const [orders] = await db.execute(getOrders, [order_id, userId]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

        const [items] = await db.execute(`
            SELECT oi.food_id, oi.quantity, rm.name, rm.price, rm.food_image_path
            FROM order_item oi
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

// COUPON ENDPOINTS

// GET /api/user/coupons - Get available website coupons
router.get('/coupons', authMiddleWare, async (req, res) => {
    try {
        const [coupons] = await db.execute(
            `SELECT coupon_code, discount_percent, min_order_value, expiry_date 
             FROM coupon 
             WHERE is_active = 1 AND expiry_date >= CURDATE()`
        );
        res.status(200).json(coupons);
    } catch (err) {
        console.error('Error fetching website coupons', err);
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// POST /api/user/cart/breakdown - Calculate total including all discounts
router.post('/cart/breakdown', authMiddleWare, async (req, res) => {
    const { cartItems, coupon_code } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    try {
        let subtotal = 0;
        let restaurant_discount = 0;
        let website_discount = 0;
        const delivery_fee = 50;

        for (const item of cartItems) {
            const [foodRow] = await db.execute(
                `SELECT price FROM Restaurant_Menu WHERE food_id = ?`,
                [item.food_id]
            );

            if (foodRow.length === 0) continue;

            const price = parseFloat(foodRow[0].price);
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            const [resCoupons] = await db.execute(
                `SELECT fic.discount_type, fic.discount_value
                 FROM couponed_items ci
                 JOIN food_item_coupon fic ON ci.coupon_id = fic.coupon_id
                 WHERE ci.food_id = ? AND ci.is_active = 1 AND ci.expires_on >= NOW()`,
                [item.food_id]
            );

            if (resCoupons.length > 0) {
                const coupon = resCoupons[0];
                let discountAmount = 0;

                if (coupon.discount_type === 'PERCENT') {
                    discountAmount = itemTotal * (parseFloat(coupon.discount_value) / 100);
                } else if (coupon.discount_type === 'FIXED') {
                    discountAmount = parseFloat(coupon.discount_value) * item.quantity;
                }

                discountAmount = Math.min(discountAmount, itemTotal);
                restaurant_discount += discountAmount;
            }
        }

        const subtotalAfterResDiscount = subtotal - restaurant_discount;

        let websiteCouponMessage = '';
        let websiteCouponApplied = false;

        if (coupon_code) {
            const [webCoupon] = await db.execute(
                `SELECT discount_percent, min_order_value, expiry_date 
                 FROM coupon 
                 WHERE coupon_code = ? AND is_active = 1 AND expiry_date >= CURDATE()`,
                [coupon_code]
            );

            if (webCoupon.length === 0) {
                websiteCouponMessage = 'Invalid or expired website coupon';
            } else if (subtotalAfterResDiscount < parseFloat(webCoupon[0].min_order_value)) {
                websiteCouponMessage = `Min order value for this coupon is ৳${webCoupon[0].min_order_value}`;
            } else {
                website_discount = subtotalAfterResDiscount * (parseFloat(webCoupon[0].discount_percent) / 100);
                websiteCouponApplied = true;
                websiteCouponMessage = `Website coupon applied successfully!`;
            }
        }

        const finalPrice = subtotalAfterResDiscount - website_discount + delivery_fee;

        res.status(200).json({
            subtotal: parseFloat(subtotal.toFixed(2)),
            restaurant_discount: parseFloat(restaurant_discount.toFixed(2)),
            subtotal_after_res_discount: parseFloat(subtotalAfterResDiscount.toFixed(2)),
            website_discount: parseFloat(website_discount.toFixed(2)),
            delivery_fee: parseFloat(delivery_fee.toFixed(2)),
            total: parseFloat(finalPrice.toFixed(2)),
            website_coupon: {
                applied: websiteCouponApplied,
                message: websiteCouponMessage
            }
        });

    } catch (err) {
        console.error('Error calculating cart breakdown:', err);
        res.status(500).json({ message: 'Error calculating breakdown' });
    }
});

// POST /api/user/orders/:order_id/pickup-accept
router.post('/orders/:order_id/pickup-accept', authMiddleWare, async (req, res) => {
    const { order_id } = req.params;
    const userId = req.userId;
    try {
        await db.execute(
            'UPDATE orders SET status = "PREPARING", delivery_fee = 0 WHERE order_id = ? AND user_id = ? AND status = "PLACED"',
            [order_id, userId]
        );
        res.status(200).json({ message: 'Pickup accepted! Please collect from restaurant later.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/user/orders/:order_id/pickup-decline
router.post('/orders/:order_id/pickup-decline', authMiddleWare, async (req, res) => {
    const { order_id } = req.params;
    const userId = req.userId;
    try {
        await db.execute(
            'UPDATE orders SET status = "REJECTED", rejection_reason = "User declined pickup after no driver found" WHERE order_id = ? AND user_id = ?',
            [order_id, userId]
        );
        res.status(200).json({ message: 'Order cancelled as requested.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router
