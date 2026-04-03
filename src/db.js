import mysql from 'mysql2/promise';

let db;

async function createDBPool() {
  try {
    const railwayPool = mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await railwayPool.query('SELECT 1');
    console.log('Connected to Railway DB!!!');
    return railwayPool;
  } catch (err) {
    console.log('Railway failed, switching to localhost...');

    const localPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connected to Local DB!!!');
    return localPool;
  }

};

db = await createDBPool();

export default db;
