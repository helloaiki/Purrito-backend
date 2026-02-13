import jwt from 'jsonwebtoken'

function authMiddleWare(req,res,next)
{
    const authHeader = req.headers['Authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;


    if(!token)
    {
        return res.status(401).json({message:'No token provided'})
    }

    jwt.verify(token,process.env.MYSECRETKEY,(err,decoded)=>{
        if(err)
        {
            return res.status(401).json({message:'Invalid token'})
        }
        req.userId=decoded.id 
        next()
    })
}



export default authMiddleWare