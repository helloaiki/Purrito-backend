import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()




//is also related to restaurants 
// GET /api/restaurant/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const resId = req.userId
    console.log(resId)
    try {
        const getRes = `
            SELECT restaurant_id, res_name, email_address, street, city, postal_code, 
            building_name, food_program, res_image_path, description, restaurant_type 
            FROM restaurant WHERE restaurant_id = ?`;
        const [restaurant] = await db.execute(getRes, [resId]);
        if (restaurant.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res.status(200).json(restaurant[0]);
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error fetching profile' });
    }
});


//this one is related to restaurant cause its adding leftovers
// POST /api/restaurant/leftover
router.post('/leftover', authMiddleWare, async (req, res) => {
    const { food_id, made_on, quantity } = req.body;
    const resId = req.userId;
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

router.post('/setlocation', authMiddleWare, async (req, res) => {
    const { lat, long } = req.body
    const resId = req.userId
    const setLocation = `UPDATE restaurant
    SET lat=?,lng=?
    WHERE restaurant_id=?
    `
    try {
        const [result] = await db.execute(setLocation, [lat, long, resId])
        if (result.affectedRows == 0) {
            return res.status(400).json({ message: 'Error in setting the location coordinates' })
        }

        return res.status(200).json({ message: 'Successfully updated restaurant' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})



//these are related to restaurant only

//delete account
router.delete('/deleteaccount', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const deleteRes = `
        DELETE FROM restaurant  WHERE restaurant_id=?
        `
        //due to on delete cascade the related things will also be deleted from database

        const [result] = await db.execute(deleteRes, [resId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'No restaurant of this id was found' })
        }

        return res.status(200).json({ message: 'Restaurant successfully deleted' })

    }
    catch (err) {
        return res.status(500).json({ message: 'Restaurant not found' })
    }
})

//adds contact information
router.post('/addcontact', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { contact } = req.body
    try {
        const insertContact = `INSERT INTO contact_restaurant(res_id,phone_number) VALUES(?,?)`
        const [result] = await db.execute(insertContact, [resId, contact])
        return res.status(201).json({ message: 'Contact number added successfully' });
    }
    catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Duplicate entry (if unique constraint exists)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Contact number already exists' });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
})



//gets total revenue for restaurant
router.get('/totalrevenue', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getTotalRevenue = `SELECT ROUND(SUM(payment),2) AS totalIncome FROM restaurant_income WHERE restaurant_id=? AND has_delivered=1`
        const [result] = await db.query(getTotalRevenue, [resId])
        return res.status(200).json(result[0])
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets revenue for a particular time
router.get('/revenueparticulartime', authMiddleWare, async (req, res) => {
    const { monthReq, yearReq } = req.body
    const resId = req.userId
    try {
        const getRevenueBasedOnParticularTime = `
            SELECT ROUND(SUM(payment)) AS revenue
            FROM restaurant_income 
            WHERE restaurant_id=? AND YEAR(payment_date)=? AND MONTH(payment_date)=? AND has_delivered=1
        `
        const [result] = await db.query(getRevenueBasedOnParticularTime, [resId, yearReq, monthReq])
        const revenue = result[0].revenue || 0;

        return res.status(200).json({ revenue })

    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//add a menu item
router.post('/addmenuitem', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { name, coursename, price, food_image_path } = req.body

    try {
        const addMenuItem = `INSERT INTO Restaurant_Menu(name,course_name,price,food_image_path) VALUES(?,?,?,?)`
        const [result] = await db.execute(addMenuItem, [name, coursename, price, food_image_path])
        return res.status(200).json({ message: 'Added menu item successfully' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

})


//delete a menu item
router.delete('/deletemenuitem', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { foodId } = req.body

    try {
        const deleteMenuItem = `DELETE FROM Restaurant_Menu where food_id=? AND res_id=?`
        const [result] = await db.execute(deleteMenuItem, [foodId, resId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Food item not found' })
        }
        return res.status(200).json({ message: 'Deleted food item successfully' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})


//reject an order but only when status is waiting or placed
router.put('/rejectorder', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { orderId, messageToCustomer } = req.body
    try {
        const rejectOrder = `UPDATE orders
        SET status='REJECTED', rejection_reason=?
        WHERE order_id=? AND restaurant_id=? AND (status='WAITING' OR status='PLACED')`

        const [result] = await db.execute(rejectOrder, [messageToCustomer, orderId, resId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in rejecting order' })
        }

        return res.status(200).json({ message: 'Order rejected successfully' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//get most ordered item for the restaurant
router.get('/mostordereditem', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { howMany } = req.body
    try {
        const selectMostPopular = `
        SELECT food_id,name,food_image_path
        FROM Restaurant_Menu
        WHERE res_id=? 
        ORDER BY quantity_sold DESC
        LIMIT ?
        `
        const [result] = await db.execute(selectMostPopular, [resId, howMany]);

        return res.status(200).json({ topItems: result });
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets the menu for the restaurant
router.get('/menu/items', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getAllMenuItems = `SELECT *
        FROM Restaurant_Menu
        WHERE res_id=?
        `
        const [result] = await db.query(getAllMenuItems, [resId]);

        return res.status(200).json({ result });
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets details of a particular menu item
router.get('/menu/item/details/:id', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const foodId = req.params.id
    try {
        const getDetailsAboutFoodItem = `
        SELECT *
        FROM Restaurant_Menu
        WHERE res_id=? AND food_id=?
        `
        const [result] = await db.query(getDetailsAboutFoodItem, [resId, foodId])

        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})


//can update the details of a menu item
router.put('/menu/item/update/:id', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    const { foodId } = req.body;

    const allowedFields = [
        "name",
        "course_name",
        "price",
        "is_available",
        "food_image_path"
    ];

    const updates = [];
    const values = [];

    for (let key of Object.keys(req.body)) {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(req.body[key]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update" });
    }

    const updateQuery = `
        UPDATE Restaurant_Menu
        SET ${updates.join(", ")}
        WHERE food_id = ? AND res_id = ?
    `;

    values.push(foodId, resId);

    try {
        const [result] = await db.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Menu item not found or unauthorized" });
        }

        return res.status(200).json({
            message: "Menu item updated successfully"
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


//gets rating for the restaurant
router.get('/rating', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    try {
        const getRating = `
            SELECT ROUND(AVG(rating), 2) AS avg_rating
            FROM rating_restaurant
            WHERE res_id = ?
        `;

        const [result] = await db.query(getRating, [resId]);

        const avgRating = result[0].avg_rating;

        return res.status(200).json({ average_rating: avgRating || 0 });

    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//gets reviews for the restaurant
router.get('/reviews', authMiddleWare, async (req, res) => {
    const resId = req.userId

    try {
        const getReviews = `
        SELECT r.comment,u.name,r.rating
        FROM rating_restaurant r
        JOIN user u ON r.user_id=u.user_id 
        WHERE res_id=?
        `
        const [result] = await db.query(getReviews, [resId])

        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets orders that are waiting which is basically new in our books
router.get('/orders/new', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getNewOrders = `
        SELECT order_id
        FROM orders
        WHERE restaurant_id=? AND status='PLACED'
        `
        const [result] = await db.query(getNewOrders, [resId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets orders that are being prepared currently
router.get('/orders/ongoing', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getOngoingOrders = `
        SELECT order_id
        FROM orders
        WHERE restaurant_id=? AND status='PREPARING'
        `
        const [result] = await db.query(getOngoingOrders, [resId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets the menu items present in a particular order
router.get('/orders/:id/items', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const orderId = req.params.id
    try {
        const getOrderItems = `
        SELECT f.name,oi.quantity,f.food_image_path
        FROM order_item oi
        JOIN Restaurant_Menu f ON oi.food_id=f.food_id
        WHERE f.res_id=? AND oi.order_id=?
        `
        const [result] = await db.query(getOrderItems, [resId, orderId])

        if (result.length === 0) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets some priliminary info on an order
router.get('/orders/:id', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const orderId = req.params.id
    try {
        const getOrderDetails = `
            SELECT order_id,price,payment_method
            FROM orders
            WHERE restaurant_id=? AND order_id=?
        `
        const [result] = await db.query(getOrderDetails, [resId, orderId])
        if (result.length === 0) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets all the categories of a restaurant menu
router.get('/menu/categories', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getCategories = `
        SELECT DISTINCT course_name
        FROM Restaurant_Menu 
        WHERE res_id=?
        `
        const [result] = await db.query(getCategories, [resId])

        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

import { startDriverSearch } from '../utils/fulfillment.js';
import { notifyRole } from '../server.js';

// PUT /api/restaurant/orders/:id/status
router.put('/orders/:id/status', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    const orderId = req.params.id;
    const { status, rejection_reason } = req.body;

    if (!['PLACED', 'REJECTED', 'PREPARING'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update for restaurant' });
    }

    try {
        const [order] = await db.query('SELECT user_id, status FROM orders WHERE order_id = ? AND restaurant_id = ?', [orderId, resId]);
        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        const userId = order[0].user_id;

        await db.execute(
            'UPDATE orders SET status = ?, rejection_reason = ? WHERE order_id = ?',
            [status, rejection_reason || null, orderId]
        );

        const title = status === 'REJECTED' ? 'Order Rejected' : 'Order Accepted';
        const message = status === 'REJECTED'
            ? `Sorry, your order #${orderId} was rejected: ${rejection_reason}`
            : `Great news! Your order #${orderId} has been accepted and is being prepared.`;

        const [notif] = await db.execute(
            'INSERT INTO notifications (user_id, role, title, message, type) VALUES (?, "user", ?, ?, "ORDER_STATUS")',
            [userId, title, message]
        );

        notifyRole('user', userId, {
            notif_id: notif.insertId,
            order_id: orderId,
            title,
            message,
            status,
            type: 'ORDER_STATUS'
        });

        if (status === 'PLACED' || status === 'PREPARING') {
            startDriverSearch(orderId);
        }

<<<<<<< HEAD
        res.json({ message: `Order ${status.toLowerCase()} successfully` });

    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Error updating order status' });
=======
        const[result]=await db.execute(deactivateCoupon,[foodId,couponId])

        if(result.affectedRows==0)
        {
            return res.status(404).json({message:'Coupon could not be deactivated'})
        }

        return res.status(200).json({message:'Coupon deactivated successfully'})

s
>>>>>>> 4457ab9 (added coupon)
    }
});

export default router;
