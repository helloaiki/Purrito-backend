import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { notifyRole } from '../server.js'
import { startDriverSearch } from '../utils/fulfillment.js'
import { upload, uploadToCloudinary } from '../utils/cloudinary.js'

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

router.put('/updatefoodorgram', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { answer } = req.body
    const hasApplied = answer === 'YES' ? 1 : 0
    const updateFoodProgram = `
    UPDATE restaurant
    SET food_program=?
    WHERE restaurant_id=?
    `
    try {
        const [result] = await db.execute(updateFoodProgram, [hasApplied, resId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in updating food program' })
        }

        return res.status(200).json({ message: 'Successfully updated status' })
    }

    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})


//this one is related to restaurant cause its adding leftovers
// POST /api/restaurant/leftover
router.post('/leftover', authMiddleWare, async (req, res) => {
    const { food_id, made_on, quantity } = req.body;
    const resId = req.userId;
    const qty = quantity || 1;

    try {
        const checkQuery = `SELECT leftover_id FROM leftover_available WHERE res_id = ? AND food_id = ? AND made_on = ? AND status = 'AVAILABLE'`;
        const [existing] = await db.execute(checkQuery, [resId, food_id, made_on]);

        if (existing.length > 0) {
            const updateLeftover = `UPDATE leftover_available SET quantity = quantity + ? WHERE leftover_id = ?`;
            await db.execute(updateLeftover, [qty, existing[0].leftover_id]);
        } else {
            const insertLeftover = `INSERT INTO leftover_available (res_id, food_id, made_on, quantity) VALUES (?,?,?,?)`;
            await db.execute(insertLeftover, [resId, food_id, made_on, qty]);
        }
        res.status(200).json({ message: 'Leftover added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding leftover' });
    }
});

// GET /api/restaurant/leftovers/available
router.get('/leftovers/available', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    try {
        const query = `
            SELECT la.leftover_id, la.food_id, DATE_FORMAT(la.made_on, '%Y-%m-%d') as made_on, la.quantity, rm.name as food_name, rm.food_image_path
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            WHERE la.res_id = ? AND la.status = 'AVAILABLE' AND la.made_on >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ORDER BY la.made_on DESC
        `;
        const [availableLeftovers] = await db.execute(query, [resId]);
        res.status(200).json(availableLeftovers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching available leftovers' });
    }
});

// GET /api/restaurant/leftovers/pending
router.get('/leftovers/pending', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    try {
        const query = `
            SELECT la.res_id, la.food_id, DATE_FORMAT(la.made_on, '%Y-%m-%d') as made_on, la.quantity, la.taken_on, la.org_id, la.created_at, la.status, la.pickup_time, 
                   rm.name as food_name, rm.food_image_path, o.org_name, o.contact_number as org_contact, o.email_address as org_email
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN organization o ON la.org_id = o.org_id
            WHERE la.res_id = ? AND la.status = 'PENDING'
            ORDER BY la.made_on ASC
        `;
        const [pendingClaims] = await db.execute(query, [resId]);
        res.status(200).json(pendingClaims);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching pending claims' });
    }
});

// POST /api/restaurant/leftovers/accept
router.post('/leftovers/accept', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    const { food_id, org_id, made_on, pickup_time } = req.body;

    if (!pickup_time) {
        return res.status(400).json({ message: 'Pickup time is required to accept a claim' });
    }

    try {
        const query = `
            UPDATE leftover_available
            SET status = 'ACCEPTED', pickup_time = ?
            WHERE res_id = ? AND food_id = ? AND org_id = ? AND made_on = ? AND status = 'PENDING'
        `;
        const [result] = await db.execute(query, [pickup_time, resId, food_id, org_id, made_on]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Claim not found or not in PENDING state' });
        }

        const [foodDetails] = await db.execute('SELECT name FROM Restaurant_Menu WHERE food_id = ?', [food_id]);
        const foodName = foodDetails[0] ? foodDetails[0].name : `Food #${food_id}`;

        await db.execute(
            'INSERT INTO notifications (org_id, role, title, message, type) VALUES (?,?,?,?,?)',
            [org_id, 'organization', 'Claim Accepted', `Your claim for ${foodName} has been accepted. Pickup at: ${pickup_time}`, 'CLAIM_ACCEPTED']
        )

        notifyRole('organization', org_id, {
            title: 'Claim Accepted',
            message: `Your claim for ${foodName} has been accepted. Pickup at: ${pickup_time}`,
            type: 'CLAIM_ACCEPTED',
            food_id: food_id
        })

        res.status(200).json({ message: 'Claim accepted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error accepting claim' });
    }
});

// POST /api/restaurant/leftovers/reject
router.post('/leftovers/reject', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    const { food_id, org_id, made_on } = req.body;

    try {
        const checkPending = `SELECT leftover_id, quantity FROM leftover_available WHERE res_id = ? AND food_id = ? AND org_id = ? AND made_on = ? AND status = 'PENDING' LIMIT 1`;
        const [pending] = await db.execute(checkPending, [resId, food_id, org_id, made_on]);

        if (pending.length === 0) {
            return res.status(404).json({ message: 'Claim not found or not in PENDING state' });
        }

        const pendingClaim = pending[0];

        const checkAvail = `SELECT leftover_id FROM leftover_available WHERE res_id = ? AND food_id = ? AND made_on = ? AND status = 'AVAILABLE' LIMIT 1`;
        const [available] = await db.execute(checkAvail, [resId, food_id, made_on]);

        if (available.length > 0) {
            await db.execute('UPDATE leftover_available SET quantity = quantity + ? WHERE leftover_id = ?', [pendingClaim.quantity, available[0].leftover_id]);
            await db.execute('DELETE FROM leftover_available WHERE leftover_id = ?', [pendingClaim.leftover_id]);
        } else {
            await db.execute('UPDATE leftover_available SET status = "AVAILABLE", org_id = NULL WHERE leftover_id = ?', [pendingClaim.leftover_id]);
        }

        const [foodDetails] = await db.execute('SELECT name FROM Restaurant_Menu WHERE food_id = ?', [food_id]);
        const foodName = foodDetails[0] ? foodDetails[0].name : `Food #${food_id}`;

        await db.execute(
            'INSERT INTO notifications (org_id, role, title, message, type) VALUES (?,?,?,?,?)',
            [org_id, 'organization', 'Claim Rejected', `Your claim for ${foodName} has been rejected.`, 'CLAIM_REJECTED']
        )

        notifyRole('organization', org_id, {
            title: 'Claim Rejected',
            message: `Your claim for ${foodName} has been rejected.`,
            type: 'CLAIM_REJECTED',
            food_id: food_id
        })

        res.status(200).json({ message: 'Claim rejected successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error rejecting claim' });
    }
});

router.post('/addfoodcharacteristic', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { foodId, characteristics } = req.body

    if (!Array.isArray(characteristics)) {
        return res.status.json({ message: 'Characteristics must be in an array' })
    }

    const uniqueCharacteristics = [...new Set(characteristics.map(c => c.trim()).filter(c => c != " " && c != ""))]
    const checkEligibility = `
    SELECT COUNT(*) AS resCount
    FROM Restaurant_Menu
    WHERE food_id=? AND res_id=?
    `
    const insertCharacteristic = `
    INSERT INTO food_characteristic(res_id,food_id,trait) VALUES(?,?,?)
    `
    try {
        const [verification] = await db.query(checkEligibility, [foodId, resId])
        if (verification[0].resCount == 0) {
            return res.status(404).json({ message: 'Not authorized' })
        }

        for (let c of uniqueCharacteristics) {
            let [result] = await db.execute(insertCharacteristic, [resId, foodId, c])
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: 'Could not update food characteristics table' })
            }
        }

        return res.status(200).json({ message: 'Added food characteristics successfully' })

    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

})



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
    const { monthReq, yearReq } = req.query
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
    console.log('req.body:', req.body)
    const { name, course_name, price, food_image_path, is_available } = req.body

    try {
        const is_av = is_available == 'yes' ? 1 : 0
        const addMenuItem = `INSERT INTO Restaurant_Menu(res_id,name,course_name,price,food_image_path,is_available) VALUES(?,?,?,?,?,?)`
        const [result] = await db.execute(addMenuItem, [resId, name, course_name, price, food_image_path ?? null, is_av])
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
    const howMany = parseInt(req.query.howMany) || 3
    try {
        const selectMostPopular = `
            SELECT rm.food_id, rm.name, rm.food_image_path, 
            COALESCE(SUM(
        CASE 
            WHEN o.status = 'DELIVERED' THEN oi.quantity 
            ELSE 0 
        END
        ), 0) as total_sold
            FROM Restaurant_Menu rm
            LEFT JOIN order_item oi ON rm.food_id = oi.food_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE rm.res_id = ? 
            GROUP BY rm.food_id, rm.name, rm.food_image_path
            ORDER BY total_sold DESC
            LIMIT ?
        `;
        const [result] = await db.execute(selectMostPopular, [resId, howMany]);

        return res.status(200).json({ topItems: result });
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

//gets the menu for the restaurant
router.get('/menu/items', authMiddleWare, async (req, res) => {
    console.log('hello')
    const resId = req.userId
    try {
        const getAllMenuItems = `SELECT *
        FROM Restaurant_Menu
        WHERE res_id=?
        `
        const [result] = await db.query(getAllMenuItems, [resId]);
        console.log(result)

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
    const foodId = req.params.id;

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
            updates.push(`${key}=?`)
            if (key === "is_available") {
                values.push(req.body[key] ? 1 : 0);
            }
            else {
                values.push(req.body[key]);
            }
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
        WHERE restaurant_id=? AND status='WAITING'
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
        SELECT order_id, status
        FROM orders
        WHERE restaurant_id=? AND status IN ('PREPARING', 'PLACED')
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
            : `Great news! Your order #${orderId} has been accepted by the restaurant.`;

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

        res.json({ message: `Order ${status.toLowerCase()} successfully` });

    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

//file upload

router.post("/uploadimage", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        const imageUrl = await uploadToCloudinary(req.file.buffer, "purrito/menu-items");
        res.json({ imageUrl });
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})



//coupon stuff
router.post('/addcoupon', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { couponName, discountType, discountValue } = req.body
    if ((discountType == 'PERCENT' && (discountValue < 0 || discountValue > 100)) || (discountType == 'FIXED' && discountValue < 0)) {
        return res.status(400).json({ message: 'Invalid discount values' })
    }

    const addCoupon = `
     INSERT INTO food_item_coupon(restaurant_id,coupon_name,discount_type,discount_value) VALUES(?,?,?,?)
    `
    try {
        const [result] = await db.execute(addCoupon, [resId, couponName, discountType, discountValue])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in adding coupon' })
        }
        return res.status(200).json({ message: 'Successfully added coupon to the menu item' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.post('/addcoupon/:id', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { couponId, expiresAt } = req.body
    const foodId = req.params.id
    const checkEligibility = `
    SELECT COUNT(*) AS resCount
    FROM Restaurant_Menu
    WHERE food_id=? AND res_id=?
    `

    const checkCoupon = `
    SELECT c.discount_type,c.discount_value
    FROM food_item_coupon c
    WHERE c.coupon_id=?
    `

    const checkPrice = `
    SELECT f.price
    FROM Restaurant_Menu f
    WHERE f.food_id=?
    `


    const addCouponToItem = `
     INSERT INTO couponed_items(food_id,coupon_id,expires_on) VALUES(?,?,?)
    `

    try {
        const [tester] = await db.query(checkEligibility, [foodId, resId])
        if (tester[0].resCount == 0) {
            return res.status(404).json({ message: 'Not authorized to give a coupon on menu item' })
        }

        const [tester2] = await db.query(checkCoupon, [couponId])
        if (!tester2[0]) {
            return res.status(404).json({ message: 'Coupon not found for this food' });
        }

        const [tester3] = await db.query(checkPrice, [foodId])

        if (!tester3[0]) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (tester2[0].discount_type == 'FIXED' && parseInt(tester2[0].discount_value) > parseFloat(tester3[0].price)) {
            return res.status(400).json({ message: 'Discount cannot be greater than food price' })
        }

        const [result] = await db.execute(addCouponToItem, [foodId, couponId, expiresAt])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in adding coupon' })
        }
        return res.status(200).json({ message: 'Successfully added coupon to the menu item' })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

})

router.get('/getcoupons/:foodid', authMiddleWare, async (req, res) => {
    const foodId = req.params.foodid
    const getCouponsAttachedToFoodItem = `
    SELECT c.coupon_id,cc.coupon_name,cc.discount_type,cc.discount_value 
    FROM food_item_coupon c
    JOIN couponed_items cc ON c.coupon_id=cc.coupon_id
    WHERE cc.food_id=?
    `
    try {
        const [result] = await db.query(getCouponsAttachedToFoodItem, [foodId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.delete('/deletecoupon', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { couponId } = req.body

    const deleteCoupon = `
    DELETE FROM food_item_coupon
    WHERE coupon_id=? AND restaurant_id=?
    `
    try {

        const [result] = await db.execute(deleteCoupon, [couponId, resId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in deleting coupon' })
        }
        return res.status(200).json({ message: 'Successfully deleted coupon' })

    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.put('/updatecoupon', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const { couponId, discountType, discountValue } = req.body
    if ((discountType == 'PERCENT' && (discountValue < 0 || discountValue > 100)) || (discountType == 'FIXED' && discountValue < 0)) {
        return res.status(400).json({ message: 'Invalid discount values' })
    }
    const updateCoupon = `
    UPDATE food_item_coupon 
    SET discount_type=?,discount_value=?
    WHERE restaurant_id=? AND coupon_id=?
    `
    try {
        const [result] = await db.execute(updateCoupon, [discountType, discountValue, resId, couponId])
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Error in updating coupon' })
        }
        return res.status(200).json({ message: 'Successfully updated coupon' })

    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})


router.get('/getCoupons', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const getAllCoupons = `
    SELECT *
    FROM food_item_coupon
    WHERE restaurant_id=?
    `
    try {
        const [result] = await db.query(getAllCoupons, [resId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/getCoupons/:ordered', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const order = req.params.ordered
    let getCouponsOrdered = ``;
    if (order == 'asc') {
        getCouponsOrdered = `
        SELECT *
        FROM food_item_coupon
        WHERE restaurant_id=?
        ORDER BY times_used 
        `
    }
    else {
        getCouponsOrdered = `
        SELECT *
        FROM food_item_coupon
        WHERE restaurant_id=?
        ORDER BY times_used DESC
        `
    }
    try {
        const [result] = await db.query(getCouponsOrdered, [resId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/couponeditems', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const getCouponedItems = `
    SELECT r.name,r.food_image_path,a.coupon_name,a.discount_type,a.discount_value,a.coupon_id,r.food_id
    FROM Restaurant_Menu r
    JOIN food_item_coupon a ON r.res_id=a.restaurant_id
    JOIN couponed_items c ON c.food_id=r.food_id
    WHERE a.restaurant_id=? AND c.is_active=TRUE
    `
    try {
        const [result] = await db.query(getCouponedItems, [resId])
        return res.status(200).json({ result })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.put('/deactivatecoupon/:foodid/:couponid', authMiddleWare, async (req, res) => {
    const resId = req.userId
    const foodId = req.params.foodid
    const couponId = req.params.couponid
    const checkEligibility = `
    SELECT COUNT(*) AS resCount
    FROM Restaurant_Menu
    WHERE food_id=? AND res_id=?
    `
    const deactivateCoupon = `
    UPDATE couponed_items
    SET is_active=FALSE
    WHERE food_id=? AND is_active=TRUE AND coupon_id=?
    `
    try {
        const [tester] = await db.query(checkEligibility, [foodId, resId])
        if (tester[0].resCount == 0) {
            return res.status(404).json({ message: 'Not authorized to give a coupon on menu item' })
        }

        const [result] = await db.execute(deactivateCoupon, [foodId, couponId])

        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Coupon could not be deactivated' })
        }

        return res.status(200).json({ message: 'Coupon deactivated successfully' })

    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

export default router;
