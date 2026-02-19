import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/restaurant/menu
// router.get('/menu', async (req, res) => {
//     try {
//         const getMenu = `
//             SELECT rm.*, r.res_name
//             FROM Restaurant_Menu rm
//             JOIN restaurant r ON rm.res_id = r.restaurant_id
//         `
//         const [menuItems] = await db.execute(getMenu)
//         res.status(200).json(menuItems)
//     } catch (err) {
//         console.error(err)
//         res.status(500).json({ message: 'Error fetching menu' })
//     }
// });


//is also related to restaurants 
// GET /api/restaurant/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const resId = req.userId
    try {
        const getRes = `
            SELECT restaurant_id, res_name, email_address, street, city, postal_code, 
            building_name, food_program, res_image_path, description, restaurant_type 
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



//these are related to restaurant only


router.delete('/deleteaccount',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const deleteRes=`
        DELETE FROM restaurant  WHERE restaurant_id=?
        `
        //due to on delete cascade the related things will also be deleted from database

        const [result]=await db.execute(deleteRes,[resId])
        if(result.affectedRows==0)
        {
            return res.status(401).json({message:'No restaurant of this id was found'})
        }

        return res.status(200).json({message:'Restaurant successfully deleted'})

    }
    catch(err)
    {
        return res.status(503).json({message:'Restaurant not found'})
    }
})


router.post('/addcontact',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const{contact}=req.body
    try
    {
        const insertContact=`INSERT INTO contact_restaurant(res_id,phone_number) VALUES(?,?)`
        const[result]=await db.execute(insertContact,[resId,contact])
        return res.status(201).json({message: 'Contact number added successfully'});  
    }
    catch(err)
    {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') 
        {
            return res.status(404).json({message: 'Restaurant not found'});
        }

        // Duplicate entry (if unique constraint exists)
        if (err.code === 'ER_DUP_ENTRY') 
        {
            return res.status(409).json({message: 'Contact number already exists'});
        }

        return res.status(500).json({message: 'Internal server error'});
    }
})

router.get('/totalrevenue',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const getTotalRevenue=`SELECT ROUND(SUM(payment),2) AS totalIncome FROM restaurant_income WHERE restaurant_id=? AND has_delivered=1`
        const[result]=await db.query(getTotalRevenue,[resId])
        return res.status(200).json(result[0])
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.get('/revenueparticulartime',authMiddleWare,async(req,res)=>{
    const{monthReq,yearReq}=req.body
    const resId=req.userId
    try
    {
        const getRevenueBasedOnParticularTime=`
            SELECT ROUND(SUM(payment)) AS revenue
            FROM restaurant_income 
            WHERE restaurant_id=? AND YEAR(payment_date)=? AND MONTH(payment_date)=? AND has_delivered=1
        `
        const[result]=await db.query(getRevenueBasedOnParticularTime,[resId,yearReq,monthReq])
        const revenue = result[0].revenue || 0;

        return res.status(200).json({revenue})

    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})


router.post('/addmenuitem',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const{name,coursename,price,food_image_path}=req.body

    try
    {
        const addMenuItem=`INSERT INTO Restaurant_Menu(name,course_name,price,food_image_path) VALUES(?,?,?,?)`
        const[result]=await db.execute(addMenuItem,[name,coursename,price,food_image_path])
        return res.status(200).json({message:'Added menu item successfully'})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
    
})

router.delete('/deletemenuitem',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const{foodId}=req.body

    try
    {
        const deleteMenuItem=`DELETE FROM Restaurant_Menu where food_id=? AND res_id=?`
        const[result]=await db.execute(deleteMenuItem,[foodId,resId])
        if(result.affectedRows==0)
        {
            return res.status(404).json({message:'Food item not found'})
        }
        return res.status(200).json({message:'Deleted food item successfully'})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.put('/rejectorder',authMiddleWare,async(req,res)=>{
   const resId=req.userId
   const{orderId,messageToCustomer}=req.body
   try
   {
       const rejectOrder=`UPDATE orders
        SET status='REJECTED', rejection_reason=?
        WHERE order_id=? AND restaurant_id=? AND (status='WAITING' OR status='PLACED')`

        const[result]=await db.execute(rejectOrder,[messageToCustomer,orderId,resId])
        if(result.affectedRows==0)
        {
            return res.status(404).json({message:'Error in rejecting order'})
        }

        return res.status(200).json({message:'Order rejected successfully'})
   }
   catch(err)
   {
       return res.status(500).json({message:err.message})
   }
})


router.get('/mostordereditem',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const{howMany}=req.body
    try
    {
        const selectMostPopular=`
        SELECT food_id,name,food_image_path
        FROM Restaurant_Menu
        WHERE res_id=? 
        ORDER BY quantity_sold DESC
        LIMIT ?
        `
        const [result] = await db.execute(selectMostPopular, [resId, howMany]);

        return res.status(200).json({topItems: result});
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})



router.get('/menu/items',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const getAllMenuItems=`SELECT *
        FROM Restaurant_Menu
        WHERE res_id=?
        `
        const [result] = await db.query(getAllMenuItems, [resId]);

        return res.status(200).json({result});
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.get('/menu/item/details',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const {foodId}=req.body
    try
    {
        const getDetailsAboutFoodItem=`
        SELECT *
        FROM Restaurant_Menu
        WHERE res_id=? AND food_id=?
        `
        const [result]=await db.query(getDetailsAboutFoodItem,[resId,foodId])

        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.put('/menu/item/:id', authMiddleWare, async (req, res) => {
    const resId = req.userId;         
    const {foodId} = req.body;

    const allowedFields = [
        "name",
        "course_name",
        "price",
        "is_available",
        "food_image_path"
    ];

    const updates = [];
    const values = [];

    for (let key of Object.keys(req.body)) 
    {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(req.body[key]);
        }
    }

    if (updates.length === 0) 
    {
        return res.status(400).json({message: "No valid fields provided for update"});
    }

    const updateQuery = `
        UPDATE Restaurant_Menu
        SET ${updates.join(", ")}
        WHERE food_id = ? AND res_id = ?
    `;

    values.push(foodId, resId);

    try 
    {
        const [result] = await db.query(updateQuery, values);

        if (result.affectedRows === 0) 
        {
            return res.status(404).json({message: "Menu item not found or unauthorized"});
        }

        return res.status(200).json({
            message: "Menu item updated successfully"
        });

    } catch (err) 
    {
        return res.status(500).json({message: err.message});
    }
});


// CREATE TABLE rating_restaurant
// (
//     user_id INT,
//     res_id INT,
//     order_id INT,
//     rating INT,
//     comment VARCHAR(100),
//     PRIMARY KEY(user_id,res_id,order_id),
//     FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
//     FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
//     FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
// );


router.get('/rating', authMiddleWare, async (req, res) => {
    const resId = req.userId;
    try 
    {
        const getRating = `
            SELECT ROUND(AVG(rating), 2) AS avg_rating
            FROM rating_restaurant
            WHERE res_id = ?
        `;

        const [result] = await db.query(getRating, [resId]);

        const avgRating = result[0].avg_rating;

        return res.status(200).json({average_rating: avgRating || 0});

    } 
    catch (err) 
    {
        return res.status(500).json({message: err.message});
    }
});


router.get('/reviews',authMiddleWare,async(req,res)=>{
    const resId=req.userId

    try
    {
        const getReviews=`
        SELECT r.comment,u.name,r.rating
        FROM rating_restaurant r
        JOIN user u ON r.user_id=u.user_id 
        WHERE res_id=?
        `
        const[result]=await db.query(getReviews,[resId])

        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

//gets orders that are waiting which is basically new in our books
router.get('/orders/new',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const getNewOrders=`
        SELECT order_id
        FROM orders
        WHERE restaurant_id=? AND status='PLACED'
        `
        const[result]=await db.query(getNewOrders,[resId])
        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

//gets orders that are being prepared currently

router.get('/orders/ongoing',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const getOngoingOrders=`
        SELECT order_id
        FROM orders
        WHERE restaurant_id=? AND status='PREPARING'
        `
        const[result]=await db.query(getOngoingOrders,[resId])
        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.get('/orders/:id/items',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const orderId=req.params.id
    try
    {
        const getOrderItems=`
        SELECT f.name,oi.quantity,f.food_image_path
        FROM order_item oi
        JOIN Restaurant_Menu f ON oi.food_id=f.food_id
        WHERE f.res_id=? AND oi.order_id=?
        `
        const[result]=await db.query(getOrderItems,[resId,orderId])

        if (result.length === 0) 
        {
            return res.status(404).json({message: "Order not found or unauthorized"});
        }
        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})

router.get('/orders/:id',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    const orderId=req.params.id
    try
    {
        const getOrderDetails=`
            SELECT order_id,price,payment_method
            FROM orders
            WHERE restaurant_id=? AND order_id=?
        `
        const[result]=await db.query(getOrderDetails,[resId,orderId])
        if (result.length === 0) 
        {
            return res.status(404).json({message: "Order not found or unauthorized"});
        }
        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})


router.get('/menu/categories',authMiddleWare,async(req,res)=>{
    const resId=req.userId
    try
    {
        const getCategories=`
        SELECT DISTINCT course_name
        FROM Restaurant_Menu 
        WHERE res_id=?
        `
        const[result]=await db.query(getCategories,[resId])
        
        return res.status(200).json({result})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
})







export default router