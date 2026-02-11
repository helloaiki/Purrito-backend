import jwt from 'jsonwebtoken'

function authMiddleWare(req, res, next) {
    const token = req.headers['authorization'] || req.headers['Authorization']

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    // Remove Bearer if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(tokenString, process.env.MYSECRETKEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }
        req.user = decoded
        next()
    })
}



export default authMiddleWare