import { getOrder, saveMessage } from '../services/orderService.js'


function initChatSocket(io) {
    io.on('connection', (socket) => {
        socket.on('join_order_chat', async ({ orderId, userId }) => {
            try {
                const order = await getOrder(orderId)
                if (!order) {
                    return socket.emit('error', 'Order not found')
                }
                if (Number(userId) != order.user_id && Number(userId) != order.driver_id) {
                    return socket.emit('error', 'Unauthorized')
                }
                socket.join(`order_${orderId}`)
            }
            catch (err) {
                return socket.emit('error', 'database error')
            }
        })

        socket.on('send_message', async ({ orderId, senderId, content }) => {
            try {
                console.log('hello')
                const order = await getOrder(orderId)
                if (!order) {
                    return socket.emit('error', 'order not found')
                }
                if (order.status == 'DELIVERED' || order.status == 'REJECTED') {
                    return socket.emit('error', 'Chat closed')
                }

                let role
                if (senderId == order.user_id) {
                    role = 'USER'
                }
                else if (senderId == order.driver_id) {
                    role = 'DRIVER'
                }
                else {
                    return socket.emit('error', 'Unauthorized')
                }
                const message = {
                    order_id: orderId,
                    sender_id: senderId,
                    sender_role: role,
                    contents: content
                }
                const savedMessage = await saveMessage(message)
                io.to(`order_${orderId}`).emit('receive_message', savedMessage)
            }
            catch (err) {
                return socket.emit('error', 'database error')
            }
        })
    })
}

export default initChatSocket