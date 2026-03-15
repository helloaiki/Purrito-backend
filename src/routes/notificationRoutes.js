import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for the logged-in user- user specific na. Shob notification fetch korbe
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { role } = req.query; // 'user', 'driver', 'restaurant', 'organization'

    if (!role) {
        return res.status(400).json({ message: 'Role is required' });
    }

    try {
        let query = 'SELECT * FROM notifications WHERE role = ? AND ';
        if (role === 'user') query += 'user_id = ?';
        else if (role === 'driver') query += 'driver_id = ?';
        else if (role === 'restaurant') query += 'restaurant_id = ?';
        else if (role === 'organization') query += 'org_id = ?';

        const [notifications] = await db.execute(query + ' ORDER BY is_read ASC, created_at DESC LIMIT 30', [role, userId]);
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a notification as read
router.put('/:notif_id/read', authMiddleware, async (req, res) => {
    const { notif_id } = req.params;
    try {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE notif_id = ?', [notif_id]);
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Delete a notification
router.delete('/:notif_id', authMiddleware, async (req, res) => {
    const { notif_id } = req.params;
    try {
        await db.execute('DELETE FROM notifications WHERE notif_id = ?', [notif_id]);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

export default router;
