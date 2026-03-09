import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import userRoutes from './routes/userRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import WebSocket, { WebSocketServer } from 'ws'
import { createClient } from 'redis'
import cors from 'cors';

const app = express()

// Global in-memory storage for WebSocket clients
export const orderClients = {} // { orderId: Set of ws }
export const roleClients = {   // { role: { id: Set of ws } }
    user: {},
    driver: {},
    restaurant: {},
    organization: {}
}

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
await redisClient.connect()

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
                const { role, id } = data;
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

export const notifyRole = (role, id, data) => {
    if (roleClients[role] && roleClients[role][id]) {
        const payload = JSON.stringify({ type: 'NOTIFICATION', ...data });
        roleClients[role][id].forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(payload);
            }
        });
    }
}

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

app.use(express.static(path.join(__dirname, '../public')))

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`);
})
