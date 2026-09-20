// =====================================================
// Supabase Client with Firebase-Compatible API
// =====================================================
// This wrapper provides the SAME API as Firebase so that
// existing app.js code works with minimal changes.
// Project: البراء بن مالك
// =====================================================

const SUPABASE_URL = APP_CONFIG.supabaseUrl;
const SUPABASE_ANON_KEY = APP_CONFIG.supabaseAnonKey;

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Note: supabaseClient is NOT exposed globally for security reasons

// =====================================================
// Firebase-Compatible API Wrapper
// =====================================================

// Utility: Convert camelCase to snake_case (RECURSIVE)
function toSnakeCase(obj) {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => toSnakeCase(item));
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            let val = toSnakeCase(obj[key]);
            if ((snakeKey.endsWith('_id') || snakeKey === 'id') && (val === '' || (typeof val === 'string' && val.trim() === ''))) {
                val = null;
            }
            if ((snakeKey === 'group_id' || snakeKey === 'competition_id') && val) {
                if (typeof val === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
                    val = null;
                }
            }
            result[snakeKey] = val;
        }
    }
    return result;
}

// Utility: Convert snake_case to camelCase (RECURSIVE)
function toCamelCase(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => toCamelCase(item));
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
        }
    }
    return result;
}

// ===== UI BLOCKER FOR DB WRITES (PREVENT DOUBLE CLICKS) =====
let activeDbRequests = 0;
let spinnerTimeout = null;

function showGlobalBlocker() {
    activeDbRequests++;
    if (activeDbRequests === 1) {
        let blocker = document.getElementById('global-db-blocker');
        if (!blocker) {
            // 1. The transparent click blocker (Immediate)
            blocker = document.createElement('div');
            blocker.id = 'global-db-blocker';
            blocker.style.position = 'fixed';
            blocker.style.inset = '0';
            blocker.style.zIndex = '9999999';
            blocker.style.cursor = 'wait';
            
            // 2. The visual spinner pill (Delayed & Smooth)
            const pill = document.createElement('div');
            pill.id = 'global-db-spinner-pill';
            pill.style.position = 'absolute';
            pill.style.top = '20px';
            pill.style.left = '50%';
            pill.style.transform = 'translateX(-50%) translateY(-20px)';
            pill.style.opacity = '0';
            pill.style.transition = 'all 0.3s ease';
            pill.style.background = 'white';
            pill.style.padding = '8px 16px';
            pill.style.borderRadius = '99px';
            pill.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            pill.style.display = 'flex';
            pill.style.alignItems = 'center';
            pill.style.gap = '8px';
            pill.style.color = '#059669';
            pill.style.fontWeight = 'bold';
            pill.style.fontSize = '14px';
            pill.innerHTML = `
                <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                جاري الحفظ...
            `;
            
            blocker.appendChild(pill);
            document.body.appendChild(blocker);
            
            if (!document.getElementById('spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spin-keyframes';
                style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
        }
        
        blocker.style.display = 'block';
        
        // Only show the visual spinner if the request takes more than 200ms
        const pill = document.getElementById('global-db-spinner-pill');
        if (pill) {
            pill.style.opacity = '0';
            pill.style.transform = 'translateX(-50%) translateY(-20px)';
            
            clearTimeout(spinnerTimeout);
            spinnerTimeout = setTimeout(() => {
                pill.style.opacity = '1';
                pill.style.transform = 'translateX(-50%) translateY(0)';
            }, 200); // 200ms delay to prevent flickering on fast connections
        }
    }
}

function hideGlobalBlocker() {
    activeDbRequests = Math.max(0, activeDbRequests - 1);
    if (activeDbRequests === 0) {
        const blocker = document.getElementById('global-db-blocker');
        if (blocker) {
            blocker.style.display = 'none';
        }
        const pill = document.getElementById('global-db-spinner-pill');
        if (pill) {
            pill.style.opacity = '0';
            pill.style.transform = 'translateX(-50%) translateY(-20px)';
        }
        clearTimeout(spinnerTimeout);
    }
}

// ===== COLLECTION REFERENCE (just stores table name) =====
function collection(db, tableName) {
    return { _table: tableName, _type: 'collection' };
}

// ===== DOCUMENT REFERENCE =====
function doc(db, tableName, docId) {
    // [IMPROVED]: Support doc(collectionRef) and doc(collectionRef, docId)
    if (db && db._type === 'collection') {
        const coll = db;
        const id = tableName || Math.random().toString(36).substr(2, 9);
        return { _table: coll._table, _id: id, _type: 'doc' };
    }
    return { _table: tableName, _id: docId, _type: 'doc' };
}

// ===== QUERY BUILDER =====
function query(collectionRef, ...constraints) {
    return {
        _table: collectionRef._table,
        _constraints: constraints,
        _type: 'query'
    };
}

// ===== WHERE CONSTRAINT =====
function where(field, operator, value) {
    return { _field: field, _op: operator, _value: value, _type: 'where' };
}

// ===== ORDER BY (not fully implemented, Supabase handles differently) =====
function orderBy(field, direction) {
    return { _field: field, _direction: direction, _type: 'orderBy' };
}

// ===== ADD DOCUMENT =====
async function addDoc(collectionRef, data) {
    showGlobalBlocker();
    try {
        const snakeData = toSnakeCase(data);
        // Remove ID if present to let Supabase handle auto-gen (UUID)
        delete snakeData.id;

        snakeData.created_at = new Date().toISOString();
        snakeData.updated_at = new Date().toISOString();

        const { data: result, error } = await supabaseClient
            .from(collectionRef._table)
            .insert([snakeData])
            .select()
            .single();

        if (error) {
            console.error('addDoc error:', error);
            throw error;
        }
        return {
            id: result.id,
            ref: { _table: collectionRef._table, _id: result.id, _type: 'doc' }
        };
    } finally {
        hideGlobalBlocker();
    }
}

// ===== GET SINGLE DOCUMENT =====
async function getDoc(docRef) {
    const { data, error } = await supabaseClient
        .from(docRef._table)
        .select('*')
        .eq('id', docRef._id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('getDoc error:', error);
        throw error;
    }

    if (!data) {
        return { exists: () => false, data: () => null, id: null };
    }

    return {
        exists: () => true,
        data: () => toCamelCase(data),
        id: data.id,
        ref: { _table: docRef._table, _id: data.id, _type: 'doc' }
    };
}

// ===== GET MULTIPLE DOCUMENTS =====
// [FIX]: Supabase returns max 1000 rows by default. This function paginates
// to fetch ALL rows, preventing data loss for large datasets (e.g. umar حلقة).
async function getDocs(queryOrCollection) {
    let tableName = queryOrCollection._table;
    let constraints = queryOrCollection._constraints || [];

    const PAGE_SIZE = 1000;
    let allData = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
        let query = supabaseClient
            .from(tableName)
            .select('*')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        // Apply constraints
        for (const c of constraints) {
            if (c._type === 'where') {
                const field = c._field.replace(/([A-Z])/g, '_$1').toLowerCase();
                if (c._op === '==') {
                    query = query.eq(field, c._value);
                } else if (c._op === 'in') {
                    query = query.in(field, c._value);
                } else if (c._op === 'array-contains') {
                    query = query.contains(field, [c._value]);
                }
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('getDocs error:', error);
            throw error;
        }

        const page = data || [];
        allData = allData.concat(page);

        // If we got fewer rows than PAGE_SIZE, we've reached the end
        if (page.length < PAGE_SIZE) {
            hasMore = false;
        } else {
            from += PAGE_SIZE;
        }
    }

    // Deduplicate by row ID in case of pagination overlap
    const uniqueRowMap = new Map();
    for (const row of allData) {
        if (row && row.id && !uniqueRowMap.has(row.id)) {
            uniqueRowMap.set(row.id, row);
        }
    }
    const finalData = uniqueRowMap.size > 0 ? Array.from(uniqueRowMap.values()) : allData;

    const docs = finalData.map(row => ({
        id: row.id,
        data: () => toCamelCase(row),
        ref: { _table: tableName, _id: row.id, _type: 'doc' }
    }));

    return {
        empty: docs.length === 0,
        docs: docs,
        forEach: (callback) => docs.forEach(callback),
        size: docs.length
    };
}

// ===== UPDATE DOCUMENT =====
async function updateDoc(docRef, data) {
    showGlobalBlocker();
    try {
        const snakeData = toSnakeCase(data);
        snakeData.updated_at = new Date().toISOString();

        const { error } = await supabaseClient
            .from(docRef._table)
            .update(snakeData)
            .eq('id', docRef._id);

        if (error) {
            console.error('updateDoc error:', error);
            throw error;
        }
    } finally {
        hideGlobalBlocker();
    }
}

// ===== DELETE DOCUMENT =====
async function deleteDoc(docRef) {
    showGlobalBlocker();
    try {
        const { error } = await supabaseClient
            .from(docRef._table)
            .delete()
            .eq('id', docRef._id);

        if (error) {
            console.error('deleteDoc error:', error);
            throw error;
        }
    } finally {
        hideGlobalBlocker();
    }
}

// ===== REALTIME SUBSCRIPTION (onSnapshot) =====
// [IMPROVED]: Singleton connection with debouncing to prevent connection leaks
let globalChannel = null;
let activeListeners = [];
let fetchTimeouts = {}; 

function onSnapshot(queryOrCollection, callback) {
    const tableName = queryOrCollection._table;
    const listenerId = Math.random().toString(36).substr(2, 9);

    // Initial fetch
    getDocs(queryOrCollection).then(callback).catch(console.error);

    // Add to active listeners
    activeListeners.push({
        id: listenerId,
        tableName: tableName,
        query: queryOrCollection,
        callback: callback
    });

    // Create a SINGLE global channel if it doesn't exist
    if (!globalChannel) {
        globalChannel = supabaseClient.channel('global_db_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                (payload) => {
                    const changedTable = payload.table;
                    const affectedListeners = activeListeners.filter(l => l.tableName === changedTable);
                    
                    affectedListeners.forEach((listener) => {
                        // Debounce: Wait 250ms before refetching to bundle rapid changes together
                        if (fetchTimeouts[listener.id]) clearTimeout(fetchTimeouts[listener.id]);
                        
                        fetchTimeouts[listener.id] = setTimeout(async () => {
                            try {
                                const result = await getDocs(listener.query);
                                listener.callback(result);
                            } catch (e) {
                                console.error('onSnapshot refetch error:', e);
                            }
                        }, 250); 
                    });
                }
            )
            .subscribe();
    }

    // Return unsubscribe function
    return () => {
        activeListeners = activeListeners.filter(l => l.id !== listenerId);
        if (fetchTimeouts[listenerId]) {
            clearTimeout(fetchTimeouts[listenerId]);
            delete fetchTimeouts[listenerId];
        }
        
        // Clean up channel only when NO listeners are left
        if (activeListeners.length === 0 && globalChannel) {
            supabaseClient.removeChannel(globalChannel);
            globalChannel = null;
        }
    };
}

// ===== WRITE BATCH (for batch operations) =====
function writeBatch(db) {
    const operations = [];
    return {
        delete: (docRef) => {
            operations.push({ type: 'delete', ref: docRef });
        },
        set: (docRef, data) => {
            // For Supabase, set is often add or update. In app.js contexts, usually add.
            operations.push({ type: 'set', ref: docRef, data: data });
        },
        update: (docRef, data) => {
            operations.push({ type: 'update', ref: docRef, data: data });
        },
        commit: async () => {
            if (operations.length === 0) return;

            // Check if all operations are 'set' on the same table for batch bulk insert
            const allSetSameTable = operations.every(op => op.type === 'set' && op.ref && op.ref._table && op.ref._table === operations[0].ref._table);
            if (allSetSameTable) {
                const tableName = operations[0].ref._table;
                const rows = operations.map(op => {
                    const row = toSnakeCase(op.data);
                    delete row.id;
                    const now = new Date().toISOString();
                    if (!row.created_at) row.created_at = now;
                    if (!row.updated_at) row.updated_at = now;
                    return row;
                });
                const { error } = await supabaseClient.from(tableName).insert(rows);
                if (error) {
                    console.error('Batch bulk insert error:', error);
                    throw error;
                }
                return;
            }

            // Fallback: Execute batch operations
            const promises = operations.map(op => {
                if (op.type === 'delete') {
                    return deleteDoc(op.ref);
                } else if (op.type === 'set') {
                    return addDoc({ _table: op.ref._table }, op.data);
                } else if (op.type === 'update') {
                    return updateDoc(op.ref, op.data);
                }
            });
            await Promise.all(promises);
        }
    };
}

// =====================================================
// EXPOSE AS FIREBASE-COMPATIBLE API
// =====================================================
window.db = { _supabase: true }; // Placeholder for db reference

// ===== RPC FUNCTION CALL =====
async function rpc(functionName, params = {}) {
    const { data, error } = await supabaseClient.rpc(functionName, params);
    if (error) {
        console.error('RPC error:', functionName, error);
        throw error;
    }
    return data;
}

window.firebaseOps = {
    collection,
    doc,
    query,
    where,
    orderBy,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    rpc
};

// Signal that database is ready
console.log('Supabase Initialized (Firebase-Compatible Mode)');
window.dispatchEvent(new Event('firebaseReady'));
