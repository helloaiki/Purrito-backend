import mysql from 'mysql2/promise';


const db = mysql.createPool({
<<<<<<< HEAD
    host: 'localhost',
    user: 'root',
    password: 'lol123sofunnyS',
    database: 'purrito',
=======
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
>>>>>>> 98e4f2e0f4a3b656f01a14696fc763c35b02d55a
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db