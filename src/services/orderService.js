import db from '../db.js'

async function getOrder(orderId)
{
    const[rows]=await db.query(
        `SELECT order_id,user_id,driver_id,status
        FROM orders
        WHERE order_id=?
        `
        ,[orderId]
    )

    if(rows.length==0)
    {
        return null
    }

    return rows[0]
}

async function saveMessage(message)
{
    const{order_id,sender_id,sender_role,contents}=message
    const [result]=await db.execute(`
        INSERT INTO messages(order_id,sender_id,sender_role,contents) VALUES(?,?,?,?)
        `,[order_id,sender_id,sender_role,contents])

    return {
        message_id:result.insertId,
        order_id,
        sender_id,
        sender_role,
        contents,
        is_read: false,
        timestamp_message: new Date()
    }
}

async function markMessagesAsRead(orderId, readerRole) {
    const targetRole = readerRole === 'User' ? 'Driver' : 'User';
    await db.execute(`
        UPDATE messages 
        SET is_read = TRUE 
        WHERE order_id = ? AND sender_role = ? AND is_read = FALSE
    `, [orderId, targetRole]);
}

export {getOrder,saveMessage, markMessagesAsRead}