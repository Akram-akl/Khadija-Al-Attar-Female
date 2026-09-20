// ============================================================================
// MS SQL Server Client Adapter with Firebase & Supabase Compatible Interface
// Multi-Tenant Aware: Injects APP_CONFIG.tenantId into every operation
// Realtime: Connected via Socket.io to Hostinger VPS API
// ============================================================================

(function () {
    'use strict';

    const API_URL = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.apiUrl)
        ? APP_CONFIG.apiUrl.replace(/\/+$/, '')
        : 'http://168.231.78.55:3000';

    const TENANT_ID = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.tenantId)
        ? APP_CONFIG.tenantId
        : 'e8b0a943-2c1b-4f93-8f0a-1a8e9d6c7b5e';

    console.log(`📡 [DB Adapter] Initialized with MS SQL Server API: ${API_URL} (Tenant: ${TENANT_ID})`);

    // Utility: Convert camelCase to snake_case
    function toSnakeCase(obj) {
        if (obj === null || obj === undefined) return obj;
        if (obj instanceof Date) return obj.toISOString();
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => toSnakeCase(item));
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                let val = toSnakeCase(obj[key]);
                if ((snakeKey.endsWith('_id') || snakeKey === 'id') && (val === '' || (typeof val === 'string' && val.trim() === ''))) {
                    val = null;
                }
                result[snakeKey] = val;
            }
        }
        return result;
    }

    // Utility: Convert snake_case to camelCase
    function toCamelCase(obj) {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => toCamelCase(item));
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                let val = obj[key];
                // Parse JSON strings back to objects/arrays
                if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                    try {
                        val = JSON.parse(val);
                    } catch (e) {
                        // Leave as string if not valid JSON
                    }
                }
                result[camelKey] = toCamelCase(val);
            }
        }
        return result;
    }

    // HTTP Helper with auto tenant header
    async function apiFetch(endpoint, method = 'POST', body = {}) {
        const url = `${API_URL}${endpoint}`;
        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': TENANT_ID
                },
                body: method === 'GET' ? undefined : JSON.stringify({ ...body, tenantId: TENANT_ID })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API Error [${res.status}] ${endpoint}: ${errorText}`);
            }

            return await res.json();
        } catch (err) {
            console.error(`[API Network Error] ${method} ${endpoint}:`, err);
            throw err;
        }
    }

    // =====================================================
    // Collection & Document References
    // =====================================================
    function collection(db, tableName) {
        return { _table: tableName, _type: 'collection' };
    }

    function doc(db, tableName, docId) {
        if (db && db._type === 'collection') {
            const coll = db;
            const id = tableName || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9));
            return { _table: coll._table, _id: id, _type: 'doc' };
        }
        return { _table: tableName, _id: docId, _type: 'doc' };
    }

    // =====================================================
    // Query Builder & Constraints
    // =====================================================
    function query(collectionRef, ...constraints) {
        return {
            _table: collectionRef._table,
            _constraints: constraints,
            _type: 'query'
        };
    }

    function where(field, operator, value) {
        return { _field: field, _op: operator, _value: value, _type: 'where' };
    }

    function orderBy(field, direction) {
        return { _field: field, _direction: direction, _type: 'orderBy' };
    }

    // =====================================================
    // Document Operations (CRUD)
    // =====================================================

    // Add Document
    async function addDoc(collectionRef, data) {
        const snakeData = toSnakeCase(data);
        delete snakeData.id; // Let server / MS SQL generate NEWID()

        const res = await apiFetch('/api/addDoc', 'POST', {
            table: collectionRef._table,
            data: snakeData
        });

        return {
            id: res.id,
            ref: { _table: collectionRef._table, _id: res.id, _type: 'doc' }
        };
    }

    // Set Document (Insert or Update)
    async function setDoc(docRef, data, options = {}) {
        const snakeData = toSnakeCase(data);
        if (options.merge) {
            return await updateDoc(docRef, data);
        }
        snakeData.id = docRef._id;
        const res = await apiFetch('/api/addDoc', 'POST', {
            table: docRef._table,
            data: snakeData
        });
        return { id: docRef._id, success: true };
    }

    // Update Document
    async function updateDoc(docRef, data) {
        const snakeData = toSnakeCase(data);
        const res = await apiFetch('/api/updateDoc', 'PUT', {
            table: docRef._table,
            id: docRef._id,
            data: snakeData
        });
        return res;
    }

    // Delete Document
    async function deleteDoc(docRef) {
        const res = await apiFetch('/api/deleteDoc', 'DELETE', {
            table: docRef._table,
            id: docRef._id
        });
        return res;
    }

    // Get Single Document
    async function getDoc(docRef) {
        const res = await apiFetch('/api/getDoc', 'POST', {
            table: docRef._table,
            id: docRef._id
        });

        if (!res.exists || !res.data) {
            return { exists: () => false, data: () => null, id: null };
        }

        const camelData = toCamelCase(res.data);
        return {
            exists: () => true,
            id: res.data.id,
            data: () => camelData,
            ref: { _table: docRef._table, _id: res.data.id, _type: 'doc' }
        };
    }

    // Get Multiple Documents with Constraints
    async function getDocs(queryOrCollection) {
        const tableName = queryOrCollection._table;
        const rawConstraints = queryOrCollection._constraints || [];

        // Prepare constraints for API
        const formattedConstraints = [];
        let orderClause = null;

        for (const c of rawConstraints) {
            if (c._type === 'where') {
                const snakeField = c._field.replace(/([A-Z])/g, '_$1').toLowerCase();
                formattedConstraints.push({
                    type: 'where',
                    field: snakeField,
                    op: c._op,
                    value: toSnakeCase(c._value)
                });
            } else if (c._type === 'orderBy') {
                const snakeField = c._field.replace(/([A-Z])/g, '_$1').toLowerCase();
                orderClause = { field: snakeField, direction: c._direction || 'asc' };
            }
        }

        const res = await apiFetch('/api/query', 'POST', {
            table: tableName,
            constraints: formattedConstraints,
            orderBy: orderClause
        });

        const rows = res.docs || [];
        const docs = rows.map(row => {
            const camelData = toCamelCase(row);
            return {
                id: row.id,
                data: () => camelData,
                ref: { _table: tableName, _id: row.id, _type: 'doc' }
            };
        });

        return {
            empty: docs.length === 0,
            docs: docs,
            size: docs.length,
            forEach: (cb) => docs.forEach(cb)
        };
    }

    // =====================================================
    // Realtime Subscriptions (onSnapshot via Socket.io)
    // =====================================================
    let socket = null;
    let activeListeners = [];
    let fetchTimeouts = {};

    function initSocket() {
        if (socket || typeof io === 'undefined') return;
        try {
            socket = io(API_URL, {
                query: { tenantId: TENANT_ID },
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('⚡ [Realtime] Connected to MS SQL Realtime Gateway');
            });

            socket.on('data_change', (payload) => {
                const changedTable = payload.table;
                const affectedListeners = activeListeners.filter(l => l.tableName === changedTable || changedTable === 'batch');

                affectedListeners.forEach(listener => {
                    if (fetchTimeouts[listener.id]) clearTimeout(fetchTimeouts[listener.id]);
                    fetchTimeouts[listener.id] = setTimeout(async () => {
                        try {
                            const result = await getDocs(listener.query);
                            listener.callback(result);
                        } catch (e) {
                            console.error('Realtime refetch error:', e);
                        }
                    }, 200);
                });
            });
        } catch (e) {
            console.warn('[Realtime] Socket.io init skipped:', e);
        }
    }

    function onSnapshot(queryOrCollection, callback) {
        const tableName = queryOrCollection._table;
        const listenerId = Math.random().toString(36).substr(2, 9);

        // Initial Fetch
        getDocs(queryOrCollection).then(callback).catch(console.error);

        // Initialize socket if available
        initSocket();

        activeListeners.push({
            id: listenerId,
            tableName: tableName,
            query: queryOrCollection,
            callback: callback
        });

        return () => {
            activeListeners = activeListeners.filter(l => l.id !== listenerId);
        };
    }

    // =====================================================
    // Expose APIs Globally (Drop-in replacement for Supabase)
    // =====================================================
    window.db = { _type: 'mssql_db' };
    window.firebaseOps = {
        collection,
        doc,
        query,
        where,
        orderBy,
        addDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        getDoc,
        getDocs,
        onSnapshot
    };

    // Compatibility aliases
    window.supabaseOps = window.firebaseOps;

})();
