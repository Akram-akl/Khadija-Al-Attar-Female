const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || '168.231.78.55',
    port: parseInt(process.env.DB_PORT || '1434', 10),
    database: process.env.DB_DATABASE || 'quran_groups',
    user: process.env.DB_USER || 'smartuser',
    password: process.env.DB_PASSWORD || 'Admin@3030!',
    options: {
        encrypt: false,
        trustServerCertificate: (process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'),
        enableArithAbort: true,
        connectTimeout: 20000,
        requestTimeout: 30000
    },
    pool: {
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getPool() {
    if (pool && pool.connected) {
        return pool;
    }
    try {
        console.log(`[DB] Connecting to MS SQL Server at ${config.server}:${config.port}/${config.database}...`);
        pool = await new sql.ConnectionPool(config).connect();
        console.log('✅ [DB] Connected successfully to Microsoft SQL Server.');
        pool.on('error', err => {
            console.error('[DB] Unexpected SQL Pool error:', err);
            pool = null;
        });
        return pool;
    } catch (err) {
        console.error('❌ [DB] Connection failed:', err.message);
        pool = null;
        throw err;
    }
}

module.exports = {
    sql,
    getPool
};
