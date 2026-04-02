import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import userRoutes from './routes/userRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import createAdmin from './utils/createAdmin.js'
import WebSocket, { WebSocketServer } from 'ws'
import { createClient } from 'redis'
import cors from 'cors';
import { Server as IOServer } from 'socket.io'
import http from "http"
import { roleClients, orderClients, notifyRole } from './services/notificationService.js'

const app = express()

//message part

const server = http.createServer(app)

const io = new IOServer(server, {
    cors: { origin: '*' }
})

import initChatSocket from './socket/chatSocket.js'
initChatSocket(io)

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
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379
        }
    }
);
redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
})
redisClient.connect().catch(err => console.error('Failed to connect to Redis on startup:', err.message));

const wss = new WebSocketServer({ port: 8008 })

wss.on('connection', (ws) => {
    let myIdentity = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Subscribe to order updates (tracking)
            if (data.type === 'ORDER_SUBSCRIBE' && data.orderId) {
                if (!orderClients[data.orderId]) {
                    orderClients[data.orderId] = new Set();
                }
                orderClients[data.orderId].add(ws);
                ws.orderId = data.orderId;
                console.log(`WS: Client subscribed to order ${data.orderId}`);
            }

            // Identify for notifications
            if (data.type === 'IDENTITY_REGISTER' && data.role && data.id) {
                const role = data.role;
                const id = String(data.id);
                if (roleClients[role]) {
                    if (!roleClients[role][id]) {
                        roleClients[role][id] = new Set();
                    }
                    roleClients[role][id].add(ws);
                    myIdentity = { role, id };
                    console.log(`WS: Registered identity for ${role} #${id}`);
                }
            }
        } catch (e) {
            console.error('WS parse error:', e);
        }
    });

    ws.on('close', () => {
        if (ws.orderId && orderClients[ws.orderId]) {
            orderClients[ws.orderId].delete(ws);
        }
        if (myIdentity && roleClients[myIdentity.role] && roleClients[myIdentity.role][myIdentity.id]) {
            roleClients[myIdentity.role][myIdentity.id].delete(ws);
        }
    });
});


console.log('Websocket server running on port 8008')

app.use(express.static(path.join(__dirname, '../public')))
app.use(cors())
app.use(express.json());

//routes
app.use('/auth', authRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/user', userRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/driver', driverRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin', adminRoutes)

app.use(express.static(path.join(__dirname, '../public')))

createAdmin()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`server has started on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to create admin:', err.message);
        process.exit(1);
    });