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

// GET /api/organization/leftovers
router.get('/leftovers', async (req, res) => {
    try {
        const getLeftovers = `
            SELECT la.*, rm.name as food_name, rm.food_image_path, r.res_name, r.street, r.city
            FROM leftover_available la
            JOIN Restaurant_Menu rm ON la.food_id = rm.food_id
            JOIN restaurant r ON la.res_id = r.restaurant_id
            WHERE la.org_id IS NULL
        `
        const [leftovers] = await db.execute(getLeftovers)
        res.status(200).json(leftovers)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching leftovers' })
    }
})

router.post('/claim', authMiddleWare, async (req, res) => {
    const { food_id, res_id, made_on } = req.body;
    const org_id = req.userId;

    if (!org_id) {
        return res.status(403).json({ message: 'Only organizations can claim leftovers' });
    }

    try {
        const claimQuery = `
            UPDATE leftover_available
            SET org_id = ?, taken_on = CURDATE()
            WHERE food_id= ? AND res_id =? AND made_on =? AND org_id IS NULL
        `;

        const [result] = await db.execute(claimQuery, [org_id, food_id, res_id, made_on]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ message: 'Leftover not available or taken' });
        }

        res.status(200).json({ message: 'Leftover claimed successfully' });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error claiming leftover' });
    }
});

export default router