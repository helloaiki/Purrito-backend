import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

const geocodeAddress = async (...parts) => {
    const q = parts.filter(Boolean).join(', ');
    if (!q) return { lat: null, lng: null };
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
        const r = await fetch(url, { headers: { 'User-Agent': 'PurritoApp/1.0' } });
        const d = await r.json();
        if (d && d.length > 0) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
    } catch (e) {
        console.error('Geocoding error:', e);
    }
    return { lat: null, lng: null };
};

// GET /api/organization/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    try {
        const getRes = `
            SELECT org_id, org_name, email_address, street, city, postal_code, building_name, contact_number, moto, ngo_certificate_url, rep_nid_url 
            FROM organization WHERE org_id = ?`;
        const [organization] = await db.execute(getRes, [orgId]);
        if (organization.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        const [[{ total_claimed }]] = await db.execute(`SELECT SUM(quantity) as total_claimed FROM leftover_available WHERE org_id = ?`, [orgId]);
        const [[{ total_distributed }]] = await db.execute(`SELECT SUM(amount) as total_distributed FROM distributed_food WHERE org_id = ?`, [orgId]);

        res.status(200).json({
            ...organization[0],
            total_claimed: total_claimed || 0,
            total_distributed: total_distributed || 0
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// PUT /api/organization/profile
router.put('/profile', authMiddleWare, async (req, res) => {
    const orgId = req.userId;

    const allowedFields = ['org_name', 'street', 'city', 'postal_code', 'building_name', 'moto', 'contact_number']
    const updates = [];
    const values = [];

    for (const key of Object.keys(req.body)) {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(req.body[key]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' })
    }

    if (req.body.street || req.body.city || req.body.building_name) {
        const [currOrg] = await db.execute('SELECT street, city, building_name FROM organization WHERE org_id = ?', [orgId]);
        if (currOrg.length > 0) {
            const org = currOrg[0];
            const b = req.body.building_name !== undefined ? req.body.building_name : org.building_name;
            const s = req.body.street !== undefined ? req.body.street : org.street;
            const c = req.body.city !== undefined ? req.body.city : org.city;

            const { lat, lng } = await geocodeAddress(b, s, c, 'Bangladesh');
            if (lat && lng) {
                updates.push('lat = ?', 'lng = ?');
                values.push(lat, lng);
            }
        }
    }

    values.push(orgId);

    try {
        const updateQuery = `
            UPDATE organization
            SET ${updates.join(', ')}
            WHERE org_id = ?
        `;
        const [result] = await db.execute(updateQuery, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        res.status(200).json({ message: 'Profile updated successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error updating profile' })
    }
});

// DELETE /api/organization/deleteaccount
router.delete('/deleteaccount', authMiddleWare, async (req, res) => {
    const orgId = req.userId;

    try {
        const deleteQuery = `
            DELETE FROM organization
            WHERE org_id = ?
        `;
        const [result] = await db.execute(deleteQuery, [orgId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Organization not found' })
        }
        res.status(200).json({ message: 'Profile deleted successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error deleting profile' })
    }
});

// GET /api/organization/leftovers
router.get('/leftovers', async (req, res) => {
    try {
        const getLeftovers = `
            SELECT la.food_id, la.res_id, la.quantity, la.status,
                   la.made_on as made_on,
                   rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id IS NULL AND la.status = 'AVAILABLE'
            ORDER BY la.made_on ASC
        `
        const [leftovers] = await db.execute(getLeftovers)
        res.status(200).json(leftovers)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching leftovers' })
    }
});

// POST /api/organization/claim
router.post('/claim', authMiddleWare, async (req, res) => {
    const { food_id, res_id, made_on } = req.body;
    const orgId = req.userId;

    if (!orgId) {
        return res.status(403).json({ message: 'Only organizations can claim leftovers' });
    }

    if (!food_id || !res_id || !made_on) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const cleanDate = new Date(made_on).toLocaleDateString('en-CA');

    try {
        const claimQuery = `
            UPDATE leftover_available
            SET org_id = ?, status = 'PENDING'
            WHERE food_id= ? AND res_id =? AND made_on =? AND org_id IS NULL AND status = 'AVAILABLE'
        `;

        const [result] = await db.execute(claimQuery, [orgId, food_id, res_id, cleanDate]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Leftover not available or already claimed' });
        }

        res.status(200).json({ message: 'Claim requested successfully. Waiting for restaurant approval.' });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error claiming leftover' });
    }
});

// DELETE /api/organization/claim
router.delete('/claim', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    const { food_id, res_id, made_on } = req.body;
    const cleanDate = new Date(made_on).toLocaleDateString('en-CA');

    try {
        const [result] = await db.execute(`
            UPDATE leftover_available
            SET org_id = NULL, status = 'AVAILABLE'
            WHERE food_id = ? AND res_id = ? AND made_on = ? AND org_id = ? AND status = 'PENDING'
            `, [food_id, res_id, cleanDate, orgId])

        console.log('Affected rows:', result.affectedRows)

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Claim not found or cannot be cancelled' })
        }

        res.status(200).json({ message: 'Claim cancelled successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error cancelling claim' })
    }
});

// GET /api/organization/claims/accepted
router.get('/claims/accepted', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    try {
        const [list] = await db.execute(`
            SELECT la.*, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city, cr.phone_number as restaurant_contact, r.email_address as restaurant_email
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            LEFT JOIN contact_restaurant cr ON cr.res_id = r.restaurant_id
            WHERE la.org_id = ? AND la.status = 'ACCEPTED'
            ORDER BY la.pickup_time ASC
        `, [orgId]);
        res.status(200).json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching accepted claims' });
    }
});

// GET /api/organization/claims/history
router.get('/claims/history', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    try {
        const [list] = await db.execute(`
            SELECT la.*, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id = ? AND la.status IN ('REJECTED', 'COLLECTED', 'PENDING', 'ACCEPTED')
            ORDER BY la.made_on DESC
        `, [orgId]);
        res.status(200).json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching claim history' });
    }
});

// GET /api/organization/distribution
router.get('/distribution', authMiddleWare, async (req, res) => {
    const orgId = req.userId;

    try {
        const [list] = await db.execute(`
            SELECT la.res_id, la.food_id, la.made_on, la.quantity, la.taken_on, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id = ? AND la.status = 'COLLECTED'
            ORDER BY la.taken_on DESC
        `, [orgId]);
        res.status(200).json(list);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching distribution list' })
    }
});

// DELETE /api/organization/distribution/clear
router.delete('/distribution/clear', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    const { food_id, res_id, made_on } = req.body;

    try {
        if (food_id && res_id && made_on) {
            const [result] = await db.execute(`
                DELETE FROM leftover_available
                WHERE org_id=? AND food_id = ? AND res_id = ? AND made_on = ? AND status = 'COLLECTED'
            `, [orgId, food_id, res_id, made_on]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Item not found in your distribution list' })
            }

            return res.status(200).json({ message: 'Item cleared from distribution list' })
        }

        const [result] = await db.execute(`
            DELETE FROM leftover_available
            WHERE org_id = ?
        `, [orgId]);

        res.status(200).json({ message: `Cleared ${result.affectedRows} item(s) from distribution list` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error clearing distribution list' })
    }
});

// POST /api/organization/distribution/record
router.post('/distribution/record', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    const { food_name, amount, claim_no, restaurant_name, distribution_date, people_fed, distribution_area } = req.body;

    if (!food_name || !amount || !restaurant_name || !distribution_date || !people_fed || !distribution_area) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO distributed_food 
            (org_id, food_name, amount, claim_no, restaurant_name, distribution_date, people_fed, distribution_area)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(query, [orgId, food_name, amount, claim_no || null, restaurant_name, distribution_date, people_fed, distribution_area]);
        res.status(201).json({ message: 'Distribution record added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding distribution record' });
    }
});

// GET /api/organization/distribution/records
router.get('/distribution/records', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    try {
        const query = `
            SELECT * FROM distributed_food
            WHERE org_id = ?
            ORDER BY distribution_date DESC, created_at DESC
        `;
        const [records] = await db.execute(query, [orgId]);
        res.status(200).json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching distribution records' });
    }
});


export default router