import db from '../db.js';
import { notifyRole } from '../services/notificationService.js';

// Distance between 2 points in km (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) { return deg * (Math.PI / 180); }

// Initial search from restaurant
export async function startDriverSearch(orderId) {
    try {
        await db.execute(
            'UPDATE orders SET search_start_time = NOW(), search_radius_km = 5.0, delivery_fee = 50.00 WHERE order_id = ?',
            [orderId]
        );
        await findNextDriver(orderId);
    } catch (err) {
        console.error('Error starting search:', err);
    }
}

// Find and offer to the next closest driver who hasn't been offered yet
export async function findNextDriver(orderId) {
    try {
        const [orderRows] = await db.execute(
            'SELECT restaurant_id, search_radius_km, search_start_time, delivery_fee, is_pickup_offered, status FROM orders WHERE order_id = ?',
            [orderId]
        );
        if (orderRows.length === 0) return;
        const { restaurant_id, search_radius_km, search_start_time, delivery_fee, is_pickup_offered, status: order_status } = orderRows[0];

        const activeStatuses = ['PLACED', 'WAITING'];
        if (!activeStatuses.includes(order_status)) {
            console.log(`Fulfillment: Order ${orderId} is "${order_status}". Stopping driver search.`);
            return;
        }

        // Check for 10-minute timeout for fee increase
        const startTime = new Date(search_start_time).getTime();
        const now = Date.now();
        const elapsedMinutes = (now - startTime) / 60000;

        if (elapsedMinutes >= 10 && delivery_fee <= 50.00) {
            console.log(`Fulfillment: 10 mins passed for order ${orderId}. Increasing fee and radius.`);
            await db.execute(
                'UPDATE orders SET delivery_fee = 100.00, search_radius_km = 15.0 WHERE order_id = ?',
                [orderId]
            );
            // Re-fetch to use new values
            return findNextDriver(orderId);
        }

        // Check for ultimate timeout (e.g. 20 minutes) Offer Pickup
        if (elapsedMinutes >= 20 && !is_pickup_offered) {
            console.log(`Fulfillment: No driver found after 20 mins for order ${orderId}. Offering pickup.`);
            await db.execute('UPDATE orders SET is_pickup_offered = TRUE WHERE order_id = ?', [orderId]);
            notifyUserPickup(orderId);
            return;
        }

        const [resRows] = await db.execute('SELECT lat, lng FROM restaurant WHERE restaurant_id = ?', [restaurant_id]);
        if (resRows.length === 0) return;
        const { lat: resLat, lng: resLng } = resRows[0];

        // Get drivers who haven't been offered this order yet
        const [offeredDrivers] = await db.execute('SELECT driver_id FROM driver_assignment_logs WHERE order_id = ?', [orderId]);
        const excludedIds = offeredDrivers.map(d => d.driver_id);

        const [availableDrivers] = await db.execute(
            'SELECT driver_id, lat, lng FROM driver WHERE lat IS NOT NULL AND lng IS NOT NULL AND last_active > NOW() - INTERVAL 15 MINUTE AND NOT EXISTS (SELECT 1 FROM driver_assignment_logs WHERE status="PENDING" AND driver_assignment_logs.driver_id = driver.driver_id)'
        );

        const eligibleDrivers = availableDrivers
            .filter(d => !excludedIds.includes(d.driver_id))
            .map(d => ({ ...d, distance: getDistance(resLat, resLng, d.lat, d.lng) }))
            .filter(d => d.distance <= search_radius_km)
            .sort((a, b) => a.distance - b.distance);

        if (eligibleDrivers.length === 0) {
            console.log(`Fulfillment: No more drivers in range for order ${orderId}. Waiting...`);
            // Poll again in 30 seconds if no pickup offered yet
            if (!is_pickup_offered) {
                setTimeout(() => findNextDriver(orderId), 30000);
            }
            return;
        }

        // Offer to the closest one
        await offerOrderToDriver(orderId, eligibleDrivers[0].driver_id);

    } catch (err) {
        console.error('Error in findNextDriver:', err);
    }
}

export async function offerOrderToDriver(orderId, driverId) {
    try {
        await db.execute('INSERT INTO driver_assignment_logs (order_id, driver_id, status) VALUES (?, ?, "PENDING")', [orderId, driverId]);

        const message = `New delivery available (#${orderId}). Earn more now!`;
        const [res] = await db.execute(
            'INSERT INTO notifications (driver_id, role, title, message, type, order_id) VALUES (?, "driver", "Order Offer", ?, "ORDER_OFFER", ?)',
            [driverId, message, orderId]
        );

        notifyRole('driver', driverId, {
            notif_id: res.insertId,
            order_id: orderId,
            title: 'Order Offer',
            message,
            type: 'ORDER_OFFER'
        });

        setTimeout(() => checkOfferTimeout(orderId, driverId), 60000);
    } catch (err) {
        console.error('Error offering order:', err);
    }
}

async function checkOfferTimeout(orderId, driverId) {
    const [orderRows] = await db.execute(
        'SELECT status FROM orders WHERE order_id = ?', [orderId]
    );

    if (orderRows.length === 0) return;

    const { status: order_status } = orderRows[0];
    if (!['PLACED', 'WAITING'].includes(order_status)) return;


    const [log] = await db.execute('SELECT status FROM driver_assignment_logs WHERE order_id = ? AND driver_id = ? AND status = "PENDING"', [orderId, driverId]);
    if (log.length > 0) {
        await db.execute('UPDATE driver_assignment_logs SET status = "TIMEOUT", responded_at = NOW() WHERE order_id = ? AND driver_id = ?', [orderId, driverId]);
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE driver_id = ? AND type = "ORDER_OFFER" AND order_id = ? AND is_read = FALSE', [driverId, orderId]);
        findNextDriver(orderId);
    }
}

async function notifyUserPickup(orderId) {
    const [order] = await db.query('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
    if (order.length > 0) {
        const userId = order[0].user_id;
        const title = "No Driver Found";
        const message = "We couldn't find a driver. Would you like to pick up your order from the restaurant instead? You'll save on the delivery fee!";

        await db.execute(
            'INSERT INTO notifications (user_id, role, title, message, type) VALUES (?, "user", ?, ?, "PICKUP_OFFER")',
            [userId, title, message]
        );
        notifyRole('user', userId, { title, message, type: 'PICKUP_OFFER', order_id: orderId });
    }
}
