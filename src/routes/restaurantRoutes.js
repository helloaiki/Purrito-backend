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


//is also related to restaurants 
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


//this one is related to restaurant cause its adding leftovers
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



//these are related to restaurant only


router.delete('/deleteaccount', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const deleteRes = `
        DELETE FROM restaurant  WHERE restaurant_id=?
        `
        //due to on delete cascade the related things will also be deleted from database

        const [result] = await db.execute(deleteRes, [resId])
        if (result.affectedRows == 0) {
            return res.status(401).json({ message: 'No restaurant of this id was found' })
        }

        return res.status(200).json({ message: 'Restaurant successfully deleted' })

    }
    catch (err) {
        return res.status(503).json({ message: 'Restaurant not found' })
    }
})


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

export default router

