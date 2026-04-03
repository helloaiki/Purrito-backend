import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'
import { notifyRole } from '../services/notificationService.js'

const router = express.Router()

function adminOnly(req, res, next) {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' })
    }
    next()
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    try {
        const [rows] = await db.execute('SELECT * FROM admin WHERE email_address = ?', [email])
        if (!rows.length) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const admin = rows[0]
        const match = await bcrypt.compare(password, admin.password)
        if (!match) return res.status(401).json({ message: 'Invalid credentials' })

        const token = jwt.sign(
            { adminId: admin.admin_id },
            process.env.MYSECRETKEY,
            { expiresIn: '24h' }
        )

        res.json({ token, adminId: admin.admin_id, email: admin.email_address })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/me
router.get('/me', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT admin_id, email_address FROM admin WHERE admin_id = ?',
            [req.userId]
        )
        if (!rows.length) return res.status(404).json({ message: 'Admin not found' })
        res.json(rows[0])
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// Platform Stats
router.get('/stats', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [[{ total_orders }]] = await db.execute(
            'SELECT COUNT(*) AS total_orders FROM orders'
        )
        const [[{ total_revenue }]] = await db.execute(
            'SELECT IFNULL(ROUND(SUM(payment),2),0) AS total_revenue FROM restaurant_income WHERE has_delivered=1'
        )
        const [[{ total_drivers }]] = await db.execute(
            'SELECT COUNT(*) AS total_drivers FROM driver'
        )
        const [[{ total_restaurants }]] = await db.execute(
            'SELECT COUNT(*) AS total_restaurants FROM restaurant'
        )
        const [[{ total_orgs }]] = await db.execute(
            'SELECT COUNT(*) AS total_orgs FROM organization'
        )
        const [[{ total_users }]] = await db.execute(
            'SELECT COUNT(*) AS total_users FROM user'
        )
        const [[{ pending_drivers }]] = await db.execute(
            "SELECT COUNT(*) AS pending_drivers FROM driver WHERE is_approved='PENDING'"
        )
        const [[{ pending_orgs }]] = await db.execute(
            "SELECT COUNT(*) AS pending_orgs FROM organization WHERE is_approved='PENDING'"
        )
        const [[{ pending_restaurants }]] = await db.execute(
            "SELECT COUNT(*) AS pending_restaurants FROM restaurant WHERE is_approved='PENDING'"
        )
        const [[{ delivered_orders }]] = await db.execute(
            "SELECT COUNT(*) AS delivered_orders FROM orders WHERE status='DELIVERED'"
        )
        const [[{ total_meals_donated }]] = await db.execute(
            "SELECT IFNULL(SUM(quantity),0) AS total_meals_donated FROM leftover_available WHERE status='COLLECTED'"
        )

        // Recent 7 days revenue
        const [weeklyRevenue] = await db.execute(`
            SELECT DATE_FORMAT(payment_date,'%a') AS day, ROUND(SUM(payment),2) AS revenue
            FROM restaurant_income
            WHERE has_delivered=1 AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(payment_date), DATE_FORMAT(payment_date,'%a')
            ORDER BY DATE(payment_date) ASC
            `)
        const [recentOrders] = await db.execute(`
            SELECT o.order_id, o.price, o.status, o.created_at,
                   r.res_name AS restaurant_name
            FROM orders o
            LEFT JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            ORDER BY o.created_at DESC
            LIMIT 10
        `)

        res.json({
            total_orders,
            total_revenue,
            total_drivers,
            total_restaurants,
            total_orgs,
            total_users,
            pending_drivers,
            pending_orgs,
            pending_restaurants,
            delivered_orders,
            total_meals_donated,
            weeklyRevenue,
            recentOrders
        })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/pending/drivers
router.get('/pending/drivers', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT driver_id, user_name, email_address, phone_number, verification_method, verification_doc_url, join_date, is_approved, rejection_reason
            FROM driver
            WHERE is_approved = 'PENDING'
            ORDER BY join_date DESC
            `)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/pending/restaurants
router.get('/pending/restaurants', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT restaurant_id, res_name, email_address, street, city, postal_code, building_name, restaurant_type, res_image_path, trade_license_url, tin_certificate_url, description,
                   food_program, is_approved, rejection_reason
            FROM restaurant
            WHERE is_approved = 'PENDING'
            ORDER BY restaurant_id DESC
            `)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/pending/organizations
router.get('/pending/organizations', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT org_id, org_name, email_address, contact_number, moto,
                   street, city, ngo_certificate_url, rep_nid_url, is_approved, rejection_reason
            FROM organization WHERE is_approved = 'PENDING'
            ORDER BY org_id DESC
            `)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/pending-all - Universal Approval View
router.get('/pending-all', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const query = `SELECT * FROM vw_pending_approvals ORDER BY created_at DESC`;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/drivers/:id/approve -- approve or reject driver
router.put('/drivers/:id/approve', authMiddleWare, adminOnly, async (req, res) => {
    const { action, reason } = req.body
    if (!['APPROVED', 'REJECTED'].includes(action))
        return res.status(400).json({ message: 'action must be APPROVED or REJECTED' })
    try {
        await db.execute(
            'UPDATE driver SET is_approved=?, rejection_reason=? WHERE driver_id=?',
            [action, reason || null, req.params.id]
        )

        // Persist notification
        const title = action === 'APPROVED' ? 'Application Approved!' : 'Application Rejected';
        const message = action === 'APPROVED' ? 'You can now start using Purrito.' : `Reason: ${reason}`;

        await db.execute(
            'INSERT INTO notifications (driver_id, role, title, message, type) VALUES (?, "driver", ?, ?, ?)',
            [req.params.id, title, message, action]
        );

        // Notify driver
        notifyRole('driver', req.params.id, {
            type: action,
            title,
            message,
            action
        });

        res.json({ message: `Driver ${action.toLowerCase()}` })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// PUT /api/admin/restaurants/:id/approve -- approve or reject restaurant
router.put('/restaurants/:id/approve', authMiddleWare, adminOnly, async (req, res) => {
    const { action, reason } = req.body
    if (!['APPROVED', 'REJECTED'].includes(action))
        return res.status(400).json({ message: 'action must be APPROVED or REJECTED' })
    try {
        await db.execute(
            'UPDATE restaurant SET is_approved=?, rejection_reason=? WHERE restaurant_id=?',
            [action, reason || null, req.params.id]
        )

        // Persist notification
        const title = action === 'APPROVED' ? 'Onboarding Approved!' : 'Onboarding Rejected';
        const message = action === 'APPROVED' ? 'Welcome to Purrito! You can now list and sell your food items and help the needy.' : `Reason: ${reason}`;

        await db.execute(
            'INSERT INTO notifications (restaurant_id, role, title, message, type) VALUES (?, "restaurant", ?, ?, ?)',
            [req.params.id, title, message, action]
        );

        // Notify restaurant
        notifyRole('restaurant', req.params.id, {
            type: action,
            title,
            message,
            action
        });

        res.json({ message: `Restaurant ${action.toLowerCase()}` })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// PUT /api/admin/organizations/:id/approve -- approve or reject organization
router.put('/organizations/:id/approve', authMiddleWare, adminOnly, async (req, res) => {
    const { action, reason } = req.body
    if (!['APPROVED', 'REJECTED'].includes(action))
        return res.status(400).json({ message: 'action must be APPROVED or REJECTED' })
    try {
        await db.execute(
            'UPDATE organization SET is_approved=?, rejection_reason=? WHERE org_id=?',
            [action, reason || null, req.params.id]
        )

        // Persist notification
        const title = action === 'APPROVED' ? 'Organization Approved!' : 'Organization Rejected';
        const message = action === 'APPROVED' ? 'You can now start claiming leftovers.' : `Reason: ${reason}`;

        await db.execute(
            'INSERT INTO notifications (org_id, role, title, message, type) VALUES (?, "organization", ?, ?, ?)',
            [req.params.id, title, message, action]
        );

        // Notify organization
        notifyRole('organization', req.params.id, {
            type: action,
            title,
            message,
            action
        });

        res.json({ message: `Organization ${action.toLowerCase()}` })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/drivers?search=&status=
router.get('/drivers', authMiddleWare, adminOnly, async (req, res) => {
    const { search = '', status = '' } = req.query;
    try {
        let query = `SELECT driver_id, user_name, email_address, phone_number, verification_method, join_date, is_approved
                    FROM driver WHERE 1=1`
        const params = []
        if (search) {
            query += ' AND (user_name LIKE ? OR email_address LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }

        if (status) {
            query += ' AND is_approved = ?'
            params.push(status)
        }

        query += ' ORDER BY join_date DESC LIMIT 100'
        const [rows] = await db.execute(query, params)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/restaurants?search=&status=
router.get('/restaurants', authMiddleWare, adminOnly, async (req, res) => {
    const { search = '', status = '' } = req.query;
    try {
        let query = `SELECT restaurant_id, res_name, email_address, city, restaurant_type, food_program, is_approved
                    FROM restaurant WHERE 1=1`
        const params = []
        if (search) {
            query += ' AND (res_name LIKE ? OR email_address LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }

        if (status) {
            query += ' AND is_approved = ?'
            params.push(status)
        }

        query += ' ORDER BY restaurant_id DESC LIMIT 100'
        const [rows] = await db.execute(query, params)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/organizations?search=&status=
router.get('/organizations', authMiddleWare, adminOnly, async (req, res) => {
    const { search = '', status = '' } = req.query;
    try {
        let query = `SELECT org_id, org_name, email_address, contact_number, city, is_approved
                    FROM organization WHERE 1=1`
        const params = []
        if (search) {
            query += ' AND (org_name LIKE ? OR email_address LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }

        if (status) {
            query += ' AND is_approved = ?'
            params.push(status)
        }

        query += ' ORDER BY org_id DESC LIMIT 100'
        const [rows] = await db.execute(query, params)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/users?search=
router.get('/users', authMiddleWare, adminOnly, async (req, res) => {
    const { search = '' } = req.query;
    try {
        let query = `SELECT user_id, user_name, email_address, phone_number, is_verified
                    FROM user WHERE 1=1`
        const params = []
        if (search) {
            query += ' AND (user_name LIKE ? OR email_address LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }

        query += ' ORDER BY user_id DESC LIMIT 100'
        const [rows] = await db.execute(query, params)
        res.json(rows)
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/drivers/:id
router.delete('/drivers/:id', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM driver WHERE driver_id=?',
            [req.params.id]
        )
        res.json({ message: 'Driver deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/organizations/:id
router.delete('/organizations/:id', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM organization WHERE org_id=?',
            [req.params.id]
        )
        res.json({ message: 'Organization deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/restaurants/:id
router.delete('/restaurants/:id', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM restaurant WHERE restaurant_id=?',
            [req.params.id]
        )
        res.json({ message: 'Restaurant deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM user WHERE user_id=?',
            [req.params.id]
        )
        res.json({ message: 'User deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/coupons/platform - website coupons
router.get('/coupons/platform', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM coupon ORDER BY expiry_date DESC'
        )
        res.json(rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// POST /api/admin/coupons/platform
router.post('/coupons/platform', authMiddleWare, adminOnly, async (req, res) => {
    const { coupon_code, discount_percent, min_order_value, expiry_date } = req.body
    if (!coupon_code || !discount_percent || !expiry_date)
        return res.status(400).json({ message: 'Missing required fields' })
    try {
        await db.execute(
            'INSERT INTO coupon (coupon_code, discount_percent, min_order_value, expiry_date, is_active) VALUES (?, ?, ?, ?, 1)',
            [coupon_code.toUpperCase(), discount_percent, min_order_value || 0, expiry_date]
        )
        res.status(201).json({ message: 'Coupon created' })
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Coupon code already exists' })
        return res.status(500).json({ message: err.message })
    }
})

// PUT /api/admin/coupons/platform/:code/toggle
router.put('/coupons/platform/:code/toggle', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'UPDATE coupon SET is_active = NOT is_active WHERE coupon_code = ?',
            [req.params.code]
        )
        res.json({ message: 'Coupon toggled' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/coupons/platform/:code
router.delete('/coupons/platform/:code', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM coupon WHERE coupon_code = ?',
            [req.params.code]
        )
        res.json({ message: 'Coupon deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/coupons/restaurant - all restaurant issued coupons
router.get('/coupons/restaurant', authMiddleWare, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT fic.coupon_id, fic.coupon_name, fic.discount_type,
                fic.discount_value, fic.times_used, r.res_name, r.restaurant_id
            FROM food_item_coupon fic
            JOIN restaurant r ON fic.restaurant_id = r.restaurant_id
            ORDER BY fic.times_used DESC
            LIMIT 200
        `)
        res.json(rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: err.message })
    }
})

// DELETE /api/admin/coupons/restaurant/:id
router.delete('/coupons/restaurant/:id', authMiddleWare, adminOnly, async (req, res) => {
    try {
        await db.execute('DELETE FROM food_item_coupon WHERE coupon_id=?', [req.params.id])
        res.json({ message: 'Restaurant coupon deleted' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// GET /api/admin/orders?status=&limit=
router.get('/orders', authMiddleWare, adminOnly, async (req, res) => {
    const { status = '', limit = 50 } = req.query
    try {
        let query = `
            SELECT o.order_id, o.price, o.status, o.created_at, o.delivery_address,
                   o.payment_method, r.res_name AS restaurant_name,
                   u.user_name AS customer_name
            FROM orders o
            LEFT JOIN restaurant r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN user u ON o.user_id = u.user_id
            WHERE 1=1
        `
        const params = []
        if (status) {
            query += ' AND o.status = ?'
            params.push(status)
        }
        query += ` ORDER BY o.created_at DESC LIMIT ${parseInt(limit) || 50}`
        const [rows] = await db.query(query, params)
        res.json(rows)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router