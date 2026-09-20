const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { getPool, sql } = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable CORS for all client origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
}));

app.use(express.json({ limit: '15mb' }));

// Setup Socket.io for Realtime sync
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    const tenantId = socket.handshake.query.tenantId || 'global';
    socket.join(tenantId);
    console.log(`[Socket] Client connected: ${socket.id} (Tenant: ${tenantId})`);

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

// Helper: Extract tenantId from request
function getTenantId(req) {
    return req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId || process.env.DEFAULT_TENANT_ID;
}

// Helper: Table whitelist to prevent SQL injection
const ALLOWED_TABLES = new Set([
    'students',
    'competitions',
    'groups',
    'teachers',
    'scores',
    'activity_days',
    'group_scores',
    'student_plans',
    'plan_daily_records',
    'tomorrow_plans',
    'level_settings',
    'feedback',
    'transfer_requests'
]);

function validateTable(tableName) {
    if (!ALLOWED_TABLES.has(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
    }
    return tableName;
}

// Health Check
app.get('/health', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT 1 as is_alive');
        res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

// ============================================================================
// 1. GET DOC BY ID (POST /api/getDoc)
// ============================================================================
app.post('/api/getDoc', async (req, res) => {
    try {
        const { table, id } = req.body;
        const tenantId = getTenantId(req);
        validateTable(table);

        if (!id) return res.status(400).json({ error: 'Missing document id' });

        const pool = await getPool();
        const reqSql = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('tenantid', sql.UniqueIdentifier, tenantId);

        const result = await reqSql.query(`SELECT TOP 1 * FROM [${table}] WHERE [id] = @id AND [tenantid] = @tenantid`);
        if (result.recordset.length === 0) {
            return res.json({ exists: false, data: null });
        }
        res.json({ exists: true, data: result.recordset[0] });
    } catch (err) {
        console.error('getDoc error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// 2. QUERY / GET DOCS (POST /api/query)
// ============================================================================
app.post('/api/query', async (req, res) => {
    try {
        const { table, constraints = [], orderBy, limit } = req.body;
        const tenantId = getTenantId(req);
        validateTable(table);

        const pool = await getPool();
        const reqSql = pool.request();
        reqSql.input('tenantid', sql.UniqueIdentifier, tenantId);

        let whereClauses = ['[tenantid] = @tenantid'];
        let paramCounter = 0;

        for (const c of constraints) {
            if (c.type === 'where' || c._type === 'where') {
                const rawField = (c.field || c._field || '').replace(/[^a-zA-Z0-9_]/g, '');
                const op = c.op || c._op;
                const val = (c.value !== undefined) ? c.value : c._value;

                if (!rawField) continue;

                const paramName = `p_${paramCounter++}`;

                if (op === '==' || op === '=') {
                    reqSql.input(paramName, val);
                    whereClauses.push(`[${rawField}] = @${paramName}`);
                } else if (op === 'in') {
                    if (Array.isArray(val) && val.length > 0) {
                        const inParams = [];
                        val.forEach((item, idx) => {
                            const inParamName = `p_in_${paramCounter++}_${idx}`;
                            reqSql.input(inParamName, item);
                            inParams.push(`@${inParamName}`);
                        });
                        whereClauses.push(`[${rawField}] IN (${inParams.join(',')})`);
                    } else {
                        whereClauses.push('1 = 0'); // Empty in list returns nothing
                    }
                } else if (op === '>=') {
                    reqSql.input(paramName, val);
                    whereClauses.push(`[${rawField}] >= @${paramName}`);
                } else if (op === '<=') {
                    reqSql.input(paramName, val);
                    whereClauses.push(`[${rawField}] <= @${paramName}`);
                } else if (op === '>') {
                    reqSql.input(paramName, val);
                    whereClauses.push(`[${rawField}] > @${paramName}`);
                } else if (op === '<') {
                    reqSql.input(paramName, val);
                    whereClauses.push(`[${rawField}] < @${paramName}`);
                } else if (op === 'array-contains') {
                    // Stored as JSON string
                    reqSql.input(paramName, `%"${val}"%`);
                    whereClauses.push(`[${rawField}] LIKE @${paramName}`);
                }
            }
        }

        let querySql = `SELECT `;
        if (limit && parseInt(limit, 10) > 0) {
            querySql += `TOP ${parseInt(limit, 10)} `;
        }
        querySql += `* FROM [${table}] WHERE ${whereClauses.join(' AND ')}`;

        if (orderBy && orderBy.field) {
            const cleanOrderField = orderBy.field.replace(/[^a-zA-Z0-9_]/g, '');
            const dir = (orderBy.direction && orderBy.direction.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
            querySql += ` ORDER BY [${cleanOrderField}] ${dir}`;
        } else {
            querySql += ` ORDER BY [created_at] ASC`;
        }

        const result = await reqSql.query(querySql);
        res.json({ docs: result.recordset || [] });
    } catch (err) {
        console.error('query error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// 3. ADD DOC (POST /api/addDoc)
// ============================================================================
app.post('/api/addDoc', async (req, res) => {
    try {
        const { table, data } = req.body;
        const tenantId = getTenantId(req);
        validateTable(table);

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid data payload' });
        }

        const pool = await getPool();
        const reqSql = pool.request();

        // Enforce tenantid
        data.tenantid = tenantId;
        data.created_at = data.created_at || new Date().toISOString();
        data.updated_at = new Date().toISOString();

        // Generate GUID if not specified
        const docId = data.id || null;
        if (!docId) {
            delete data.id;
        }

        const cols = [];
        const paramNames = [];
        let counter = 0;

        for (const [key, val] of Object.entries(data)) {
            const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
            const paramName = `col_${counter++}`;
            cols.push(`[${cleanKey}]`);
            paramNames.push(`@${paramName}`);

            // If object or array, store as JSON string
            if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                reqSql.input(paramName, sql.NVarChar(sql.MAX), JSON.stringify(val));
            } else {
                reqSql.input(paramName, val);
            }
        }

        const insertSql = `
            INSERT INTO [${table}] (${cols.join(', ')})
            OUTPUT INSERTED.*
            VALUES (${paramNames.join(', ')});
        `;

        const result = await reqSql.query(insertSql);
        const insertedDoc = result.recordset[0];

        // Broadcast change via Socket.io to all clients in the same tenant room
        io.to(tenantId).emit('data_change', {
            table,
            action: 'insert',
            id: insertedDoc.id,
            tenantId
        });

        res.json({ id: insertedDoc.id, doc: insertedDoc });
    } catch (err) {
        console.error('addDoc error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// 4. UPDATE DOC (PUT /api/updateDoc)
// ============================================================================
app.put('/api/updateDoc', async (req, res) => {
    try {
        const { table, id, data } = req.body;
        const tenantId = getTenantId(req);
        validateTable(table);

        if (!id || !data) {
            return res.status(400).json({ error: 'Missing id or update data' });
        }

        const pool = await getPool();
        const reqSql = pool.request();

        reqSql.input('target_id', sql.UniqueIdentifier, id);
        reqSql.input('tenantid', sql.UniqueIdentifier, tenantId);

        delete data.id;
        delete data.tenantid;
        data.updated_at = new Date().toISOString();

        const setClauses = [];
        let counter = 0;

        for (const [key, val] of Object.entries(data)) {
            const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
            const paramName = `set_${counter++}`;
            setClauses.push(`[${cleanKey}] = @${paramName}`);

            if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                reqSql.input(paramName, sql.NVarChar(sql.MAX), JSON.stringify(val));
            } else {
                reqSql.input(paramName, val);
            }
        }

        const updateSql = `
            UPDATE [${table}]
            SET ${setClauses.join(', ')}
            OUTPUT INSERTED.*
            WHERE [id] = @target_id AND [tenantid] = @tenantid;
        `;

        const result = await reqSql.query(updateSql);

        io.to(tenantId).emit('data_change', {
            table,
            action: 'update',
            id: id,
            tenantId
        });

        res.json({ success: true, updated: result.rowsAffected[0] > 0, doc: result.recordset[0] });
    } catch (err) {
        console.error('updateDoc error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// 5. DELETE DOC (DELETE /api/deleteDoc)
// ============================================================================
app.delete('/api/deleteDoc', async (req, res) => {
    try {
        const { table, id } = req.body;
        const tenantId = getTenantId(req);
        validateTable(table);

        if (!id) return res.status(400).json({ error: 'Missing id to delete' });

        const pool = await getPool();
        const reqSql = pool.request()
            .input('target_id', sql.UniqueIdentifier, id)
            .input('tenantid', sql.UniqueIdentifier, tenantId);

        const deleteSql = `DELETE FROM [${table}] WHERE [id] = @target_id AND [tenantid] = @tenantid`;
        const result = await reqSql.query(deleteSql);

        io.to(tenantId).emit('data_change', {
            table,
            action: 'delete',
            id: id,
            tenantId
        });

        res.json({ success: true, deleted: result.rowsAffected[0] > 0 });
    } catch (err) {
        console.error('deleteDoc error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// 6. BATCH OPERATIONS (POST /api/batch)
// ============================================================================
app.post('/api/batch', async (req, res) => {
    const { operations = [] } = req.body;
    const tenantId = getTenantId(req);
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        for (const op of operations) {
            validateTable(op.table);
            const reqSql = new sql.Request(transaction);
            reqSql.input('tenantid', sql.UniqueIdentifier, tenantId);

            if (op.type === 'delete') {
                reqSql.input('del_id', sql.UniqueIdentifier, op.id);
                await reqSql.query(`DELETE FROM [${op.table}] WHERE [id] = @del_id AND [tenantid] = @tenantid`);
            } else if (op.type === 'insert') {
                const data = { ...op.data, tenantid: tenantId, updated_at: new Date().toISOString() };
                const cols = Object.keys(data).map(k => `[${k.replace(/[^a-zA-Z0-9_]/g, '')}]`);
                const pNames = Object.keys(data).map((k, i) => {
                    const pn = `b_ins_${i}`;
                    const val = data[k];
                    if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                        reqSql.input(pn, sql.NVarChar(sql.MAX), JSON.stringify(val));
                    } else {
                        reqSql.input(pn, val);
                    }
                    return `@${pn}`;
                });
                await reqSql.query(`INSERT INTO [${op.table}] (${cols.join(',')}) VALUES (${pNames.join(',')})`);
            }
        }

        await transaction.commit();

        io.to(tenantId).emit('data_change', {
            table: 'batch',
            action: 'batch',
            tenantId
        });

        res.json({ success: true, count: operations.length });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch error:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 [Backend API] Listening on port ${PORT}`);
    console.log(`📡 [Realtime] Socket.io ready for connections`);
});
