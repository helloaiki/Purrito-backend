import WebSocket from 'ws';

export const orderClients = {}; // { orderId: Set of ws }
export const roleClients = {   // { role: { id: Set of ws } }
    user: {},
    driver: {},
    restaurant: {},
    organization: {},
    admin: {}
};

export const notifyRole = (role, id, data) => {
    const payload = JSON.stringify({ isNotification: true, type: 'NOTIFICATION', ...data });

    if (id === 'ALL') {
        if (roleClients[role]) {
            Object.values(roleClients[role]).forEach(idSet => {
                idSet.forEach(ws => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(payload);
                    }
                });
            });
        }
    } else {
        const key = String(id);
        if (roleClients[role] && roleClients[role][key]) {
            roleClients[role][key].forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(payload);
                }
            });
        }
    }
};
