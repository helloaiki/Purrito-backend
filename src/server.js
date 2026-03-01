import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import userRoutes from './routes/userRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import WebSocket, { WebSocketServer } from 'ws'
import { createClient } from 'redis'
import cors from 'cors';

const app = express()

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5003

//get file
const __filename = fileURLToPath(import.meta.url)
//get directory
const __dirname = dirname(__filename);

export const redisClient = createClient(
    {
        socket: {
            host: '127.0.0.1',
            port: 6379
        }
    }
);
redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
})
await redisClient.connect()

const wss = new WebSocketServer({ port: 8008 })
export const clients = {}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { orderId } = JSON.parse(message)
        if (!clients[orderId]) {
            clients[orderId] = new Set()
        }
        clients[orderId].add(ws)
        ws.on('close', () => clients[orderId].delete(ws))
    })
})

console.log('Websocket server running on port 6739')

app.use(express.static(path.join(__dirname, '../public')))

app.use(cors())
app.use(express.json());


//routes
app.use('/auth', authRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/user', userRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/driver', driverRoutes)

app.use(express.static(path.join(__dirname, '../public')))

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`);
})
