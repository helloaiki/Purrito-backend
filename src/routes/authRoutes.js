import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Geocode an address string → { lat, lng } using Nominatim (free, no API key)
const geocodeAddress = async (...parts) => {
    const query = parts.filter(Boolean).join(', ');
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'PurritoApp/1.0 (food-service)' }
        });
        const data = await res.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (err) {
        console.warn('Geocoding failed:', err.message);
    }
    return { lat: null, lng: null };
};

//signin a new user//via the auth/driver/signup//POST
router.post('/driver/signup', async (req, res) => {
    const { name, email, password, contact, verification, joinDate } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
    console.log(password, hashedPassword)

    try {
        const insertDriver = `INSERT INTO driver(user_name,email_address,password,verification_method,phone_number,join_date) VALUES(?,?,?,?,?,CURDATE())`
        const [result] = await db.execute(insertDriver, [name, email, hashedPassword, verification, contact])
        console.log(result.insertId)
        const token = jwt.sign({ driverId: result.insertId }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(201).json({ token: token, driverId: result.insertId })
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
        return res.status(200).json({ token, driverId: driver.driver_id })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

})


router.post('/restaurant/signup', async (req, res) => {

    const {
        name,
        email,
        password,
        street,
        city,
        postalcode,
        buildingname,
        foodprogram,
        resimagepath,
        description,
        restauranttype
    } = req.body

    const hashedPassword = bcrypt.hashSync(password, 8)

    const isSignedUpForFoodDonationProgram = foodprogram === "YES" ? 1 : 0

    try {

        const { lat, lng } = await geocodeAddress(
            buildingname,
            street,
            city,
            'Bangladesh'
        )

        console.log(`Geocoded restaurant address → lat:${lat}, lng:${lng}`)

        const insertRestaurant = `
        INSERT INTO restaurant
        (res_name,email_address,password,street,city,postal_code,building_name,food_program,res_image_path,description,restaurant_type,lat,lng)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `

        const [result] = await db.execute(insertRestaurant, [
            name,
            email,
            hashedPassword,
            street ?? null,
            city ?? null,
            postalcode ?? null,
            buildingname ?? null,
            isSignedUpForFoodDonationProgram,
            resimagepath ?? null,
            description ?? null,
            restauranttype ?? null,
            lat,
            lng
        ])

        const token = jwt.sign(
            { restaurantId: result.insertId },
            process.env.MYSECRETKEY,
            { expiresIn: '24h' }
        )

        return res.status(201).json({
            token: token,
            restaurantId: result.insertId
        })

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
        return res.status(200).json({ token, restaurantId: restaurant.restaurant_id })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

})


router.post('/user/signup', async (req, res) => {
    const { name, email, password, contact } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address format' });
    }

    try {
        const insertUser = `INSERT INTO  user (user_name, email_address, password, phone_number, verification_token, is_verified, verification_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`;

        const [result] = await db.execute(insertUser, [
            name,
            email,
            hashedPassword,
            contact,
            verificationToken,
            false
        ]);

        const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
        try {
            await transporter.sendMail({
                from: `"Purrito" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify your Purrito account',
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                        <h2 style="color:#A34A39">Welcome to Purrito!</h2>
                        <p>Click below to verify your email address.</p>
                        <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#A34A39;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
                            Verify Email
                        </a>
                        <p style="color:#888;font-size:0.85rem;margin-top:20px">Link expires in 24 hours.</p>
                    </div>
                `
            });
            res.status(201).json({ message: 'Account created! Please check your email to verify.' });
        } catch (emailErr) {
            await db.execute('DELETE FROM user WHERE user_id = ?', [result.insertId]);
            return res.status(400).json({ message: 'Could not send to this email. Please use a real email address.' });
        }
    } catch (err) {
        console.error(err);
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
        if (!user.is_verified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }
        const doesPasswordMatch = await bcrypt.compare(password, user.password);

        if (!doesPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.MYSECRETKEY,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ token, userId: user.user_id });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//Organization signup
import { upload } from '../utils/cloudinary.js';

router.post('/organization/signup', upload.fields([
    { name: 'ngo_certificate', maxCount: 1 },
    { name: 'rep_nid', maxCount: 1 }
]), async (req, res) => {
    const { name, email, password, street, city, postalcode, buildingname, moto, contact_number } = req.body

    const ngo_certificate_url = req.files?.['ngo_certificate'] ? req.files['ngo_certificate'][0].path : null;
    const rep_nid_url = req.files?.['rep_nid'] ? req.files['rep_nid'][0].path : null;

    const hashedPassword = bcrypt.hashSync(password, 8)
    try {
        // Auto-geocode the organization address
        const { lat, lng } = await geocodeAddress(buildingname, street, city, 'Bangladesh');
        console.log(`Geocoded org address → lat:${lat}, lng:${lng}`);

        const insertOrganization = `INSERT INTO organization(org_name,email_address,password,street,city,postal_code,building_name,lat,lng, moto, contact_number, ngo_certificate_url, rep_nid_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`
        const [result] = await db.execute(insertOrganization, [name, email, hashedPassword, street, city, postalcode, buildingname, lat, lng, moto || null, contact_number || null, ngo_certificate_url, rep_nid_url])
        console.log(result.insertId)
        const token = jwt.sign({ orgId: result.insertId }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(201).json({ token: token, orgId: result.insertId })
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

        const token = jwt.sign({ orgId: organization.org_id }, process.env.MYSECRETKEY, { expiresIn: '24h' })
        return res.status(200).json({ token, orgId: organization.org_id })

    } catch (err) {
        return res.status(503).json({ message: err.message })
    }

});

// GET /auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'No verification token found.' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT user_id, is_verified, verification_token_expires_at > NOW() as is_valid FROM user WHERE verification_token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid verification link or already used.' });
        }

        const user = rows[0];

        if (!user.is_valid) {
            return res.status(400).json({ message: 'Verification link has expired.' });
        }

        if (!user.is_verified) {
            await db.execute(
                'UPDATE user SET is_verified = TRUE WHERE user_id = ?',
                [user.user_id]
            );
        }

        return res.status(200).json({ message: 'Email verified successfully!' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [user] = await db.execute('SELECT user_id FROM user WHERE email_address = ?', [email]);
        if (user.length === 0) {
            return res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await db.execute(
            'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))',
            [token, user[0].user_id]
        );

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        await transporter.sendMail({
            from: `"Purrito" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your Purrito password',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                    <h2 style="color:#A34A39">Reset your password</h2>
                    <p>Click below to reset your password. This link expires in 15 minutes.</p>
                    <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#A34A39;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
                        Reset Password
                    </a>
                    <p style="color:#888;font-size:0.85rem;margin-top:20px">If you didn't request this, ignore this email.</p>
                </div>
            `
        });
        res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, new_password } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = bcrypt.hashSync(new_password, 8);
        await db.execute(
            'UPDATE user SET password = ? WHERE user_id = ?',
            [hashedPassword, rows[0].user_id]
        );

        await db.execute(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
            [token]
        );

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router