import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import userRoutes from './routes/userRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import cors from 'cors';

const app = express()

const PORT = process.env.PORT || 5003

//get file
const __filename = fileURLToPath(import.meta.url)
//get directory
const __dirname = dirname(__filename);

app.use(cors())
app.use(express.json());


//routes
app.use('/auth', authRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/user', userRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/driver', driverRoutes)

app.use(express.static(path.join(__dirname, '../public')))

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`);
})
