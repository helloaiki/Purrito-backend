import jwt from 'jsonwebtoken';

function authMiddleWare(req, res, next) 
{
    const authHeader = req.headers.authorization; 

    if (!authHeader) 
    {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    jwt.verify(token, process.env.MYSECRETKEY, (err, decoded) => {
        if (err) 
        {
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (decoded.userId) 
        {
            req.userId = decoded.userId;
            req.role = 'user';
        } 
        else if (decoded.restaurantId) 
        {
            req.userId = decoded.restaurantId;
            req.role = 'restaurant';
        } 
        else if (decoded.driverId) 
        {
            req.userId = decoded.driverId;
            req.role = 'driver';
        } 
        else //add organisation id here
        {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        next();
    });
}

export default authMiddleWare;


