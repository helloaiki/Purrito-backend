import express from 'express'
import db from '../db.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/organization/profile
router.get('/profile', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    try {
        const getRes = `
            SELECT org_id, org_name, email_address, street, city, postal_code, building_name 
            FROM organization WHERE org_id = ?`;
        const [organization] = await db.execute(getRes, [orgId]);
        if (organization.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json(organization[0]);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// PUT /api/organization/profile
router.put('/profile', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    const { org_name, street, city, postal_code, building_name } = req.body;

    const allowedFields = ['org_name', 'street', 'city', 'postal_code', 'building_name']
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
            SELECT la.*, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id IS NULL
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

    try {
        const claimQuery = `
            UPDATE leftover_available
            SET org_id = ?, taken_on = CURDATE()
            WHERE food_id= ? AND res_id =? AND made_on =? AND org_id IS NULL
        `;

        const [result] = await db.execute(claimQuery, [orgId, food_id, res_id, made_on]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Leftover not available or taken' });
        }

        res.status(200).json({ message: 'Leftover claimed successfully' });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error claiming leftover' });
    }
});

// DELETE /api/organization/claim
router.delete('/claim', authMiddleWare, async (req, res) => {
    const orgId = req.userId;
    const { food_id, res_id, made_on } = req.body;

    try {
        const [result] = await db.execute(`
            UPDATE leftover_available
            SET org_id = NULL, taken_on = NULL
            WHERE food_id = ? AND res_id = ? AND made_on = ? AND org_id = ?
            `, [food_id, res_id, made_on, orgId])

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Claim not found or already distributed' })
        }

        res.status(200).json({ message: 'Claim cancelled successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error cancelling claim' })
    }
});

// GET /api/organization/distribution
router.get('/distribution', authMiddleWare, async (req, res) => {
    const orgId = req.userId;

    try {
        const [list] = await db.execute(`
            SELECT la.res_id, la.food_id, la.made_on, la.quantity, la.taken_on, la.created_at, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id = ?
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
                WHERE org_id=? AND food_id = ? AND res_id = ? AND made_on = ?
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


export default router