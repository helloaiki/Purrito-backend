import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()

//signin a new user//via the auth/driver/signup//POST
router.post('/driver/signup', async (req, res) => {
    const { name, email, password, contact, verification, joinDate } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
    console.log(password, hashedPassword)

    try {
        const insertDriver = `INSERT INTO driver(user_name,email_address,password,verification_method,phone_number,join_date) VALUES(?,?,?,?,?,?)`
        const [result] = await db.execute(insertDriver, [name, email, hashedPassword, verification, contact, joinDate])
        console.log(result.insertId)
        const token = jwt.sign({ id: result.insertId }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(201).json({ token: token })
    }
    catch (err) {
        console.log(err.message)
        return res.status(503).json({ message: err.message })
    }
})



router.post('/driver/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const getUser = `SELECT * FROM driver WHERE email_address=?`
        const [result] = await db.execute(getUser, [email])
        if (result.length == 0) {
            return res.status(401).json({ message: 'No user corresponding to this information' })
        }
        const driver = result[0];
        const doesPasswordMatch = await bcrypt.compare(password, driver.password)
        if (!doesPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        const token = jwt.sign({ driverId: driver.driver_id }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(200).json({ token })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

})


//restaurant sign up
router.post('/restaurant/signup', async (req, res) => {
    const { name, email, password, street, city, postalcode, buildingname, foodprogram, resimagepath, description, restauranttype } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
    const isSignedUpForFoodDonationProgram = foodprogram === "YES" ? true : false;
    try {
        const insertRestaurant = `INSERT INTO restaurant(res_name,email_address,password,street,city,postal_code,building_name,food_program,res_image_path,description,restaurant_type) VALUES(?,?,?,?,?,?,?,?,?,?,?)`
        const [result] = await db.execute(insertRestaurant, [name, email, hashedPassword, street, city, postalcode, buildingname, isSignedUpForFoodDonationProgram, resimagepath, description, restauranttype])
        console.log(result.insertId)
        const token = jwt.sign({ id: result.insertId }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(201).json({ token: token })
    }
    catch (err) {
        console.log(err.message)
        return res.status(503).json({ message: err.message })
    }
})



router.post('/restaurant/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const getUser = `SELECT * FROM restaurant WHERE email_address=?`
        const [result] = await db.execute(getUser, [email])
        if (result.length == 0) {
            return res.status(401).json({ message: 'No user corresponding to this information' })
        }
        const restaurant = result[0];
        const doesPasswordMatch = await bcrypt.compare(password, restaurant.password)
        if (!doesPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        const token = jwt.sign({ restaurantId: restaurant.restaurant_id }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(200).json({ token })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

})


router.post('/user/signup', async (req, res) => {
    const { name, email, password, contact } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        const insertUser = `INSERT INTO  user (user_name, email_address, password, phone_number) VALUES (?, ?, ?, ?)`;

        const [result] = await db.execute(insertUser, [
            name,
            email,
            hashedPassword,
            contact
        ]);

        const token = jwt.sign(
            { userId: result.insertId },
            process.env.MYSECRETKEY,
            { expiresIn: '24h' }
        );
        return res.status(201).json({ token });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const getUser = `SELECT * FROM user WHERE email_address = ?`;
        const [result] = await db.execute(getUser, [email]);

        if (result.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = result[0];
        const doesPasswordMatch = await bcrypt.compare(password, user.password);

        if (!doesPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.MYSECRETKEY,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//Organization signup
router.post('/organization/signup', async (req, res) => {
    const { name, email, password, street, city, postalcode, buildingname } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
    try {
        const insertOrganization = `INSERT INTO organization(org_name,email_address,password,street,city,postal_code,building_name) VALUES(?,?,?,?,?,?,?)`
        const [result] = await db.execute(insertOrganization, [name, email, hashedPassword, street, city, postalcode, buildingname])
        console.log(result.insertId)
        const token = jwt.sign({ id: result.insertId }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(201).json({ token: token })
    }
    catch (err) {
        console.log(err.message)
        return res.status(503).json({ message: err.message })
    }
});

//Organization login
router.post('/organization/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const getUser = `SELECT * FROM organization WHERE email_address=?`
        const [result] = await db.execute(getUser, [email])
        if (result.length == 0) {
            return res.status(401).json({ message: 'No user corresponding to this information' })
        }
        const organization = result[0];
        const doesPasswordMatch = await bcrypt.compare(password, organization.password)
        if (!doesPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        const token = jwt.sign({ id: organization.org_id }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(200).json({ token })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

});


export default router