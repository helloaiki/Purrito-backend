import jwt from 'jsonwebtoken';
import db from '../db.js';

async function authMiddleWare(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.MYSECRETKEY);
        
        if (decoded.userId) {
            req.userId = decoded.userId;
            req.role = 'user';
        }
        else if (decoded.restaurantId) {
            req.userId = decoded.restaurantId;
            req.role = 'restaurant';
            
        }
        else if (decoded.driverId) {
            req.userId = decoded.driverId;
            req.role = 'driver';

        }
        else if (decoded.orgId) {
            req.userId = decoded.orgId;
            req.role = 'org';

        }
        else if (decoded.adminId) {
            req.userId = decoded.adminId;
            req.role = 'admin';
        }
        else {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export default authMiddleWare;


