import mysql from 'mysql2/promise';

let db;

async function createDBPool() {
  try {
    const railwayPool = mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: Number(process.env.MYSQLPORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await railwayPool.query('SELECT 1');
    console.log('Connected to Railway DB!!!');
    return railwayPool;

  } catch (err) {
    console.error('Railway failed:', err.message);
    console.log('Switching to localhost...');

    

    try {
      const localPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      await localPool.query('SELECT 1');
      console.log('Connected to Local DB!!!');
      return localPool;

    } catch (err2) {
      console.error('Local DB connection failed:', err2.message);
      process.exit(1);
    }
  }
}

db = await createDBPool();

export default db;