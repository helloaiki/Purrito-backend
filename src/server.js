import express from 'express'
import path,{dirname} from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
//import restaurantRoutes from './routes/restaurantRoutes.js'
import cors from 'cors';
import authMiddleWare from './middleware/authMiddleware.js';

const app=express()

const PORT=process.env.PORT||5003

//get file
const __filename=fileURLToPath(import.meta.url)
//get directory
const __dirname=dirname(__filename);

app.use(express.static(path.join(__dirname,'../public')))

app.use(cors())
app.use(express.json());


//routes
app.use('/auth',authRoutes)
//app.use('/restaurant/tasks',authMiddleWare,restaurantRoutes)

app.listen(PORT,()=>{
    console.log(`server has started on port: ${PORT}`);
})
