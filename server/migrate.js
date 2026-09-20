/**
 * Data Migration Script: Supabase -> Microsoft SQL Server
 * Migrates all records from Supabase into MS SQL Server while injecting the tenantid.
 * Run via: node migrate.js
 */

const { createClient } = require('@supabase/supabase-js');
const { getPool, sql } = require('./db');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkbetpbcyssptbijimbx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TARGET_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'e8b0a943-2c1b-4f93-8f0a-1a8e9d6c7b5e';

if (!SUPABASE_ANON_KEY) {
    console.error('❌ Error: SUPABASE_ANON_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES_ORDERED = [
    'competitions',
    'students',
    'groups',
    'teachers',
    'activity_days',
    'scores',
    'group_scores',
    'student_plans',
    'plan_daily_records',
    'tomorrow_plans',
    'level_settings',
    'feedback',
    'transfer_requests'
];

async function fetchAllSupabaseRows(table) {
    let allRows = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('id', { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) {
            console.warn(`[Migrate] Warning reading Supabase table ${table}:`, error.message);
            break;
        }

        const rows = data || [];
        allRows = allRows.concat(rows);
        if (rows.length < pageSize) {
            hasMore = false;
        } else {
            from += pageSize;
        }
    }

    return allRows;
}

async function migrateTable(pool, table) {
    console.log(`\n📦 Migrating table: [${table}]...`);
    const rows = await fetchAllSupabaseRows(table);
    console.log(`   Found ${rows.length} rows in Supabase.`);

    if (rows.length === 0) return;

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const row of rows) {
        try {
            // Check if already exists in MS SQL
            const checkReq = pool.request()
                .input('id', sql.UniqueIdentifier, row.id)
                .input('tenantid', sql.UniqueIdentifier, TARGET_TENANT_ID);
            
            const existing = await checkReq.query(`SELECT 1 FROM [${table}] WHERE [id] = @id AND [tenantid] = @tenantid`);
            if (existing.recordset.length > 0) {
                skipCount++;
                continue;
            }

            // Insert into MS SQL
            const insertReq = pool.request();
            row.tenantid = TARGET_TENANT_ID;

            const cols = [];
            const paramNames = [];
            let i = 0;

            for (const [key, val] of Object.entries(row)) {
                const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
                const pName = `p_${i++}`;
                cols.push(`[${cleanKey}]`);
                paramNames.push(`@${pName}`);

                if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                    insertReq.input(pName, sql.NVarChar(sql.MAX), JSON.stringify(val));
                } else {
                    insertReq.input(pName, val);
                }
            }

            const insertSql = `INSERT INTO [${table}] (${cols.join(', ')}) VALUES (${paramNames.join(', ')})`;
            await insertReq.query(insertSql);
            successCount++;
        } catch (err) {
            failCount++;
            console.error(`   ❌ Failed row id ${row.id} in ${table}:`, err.message);
        }
    }

    console.log(`   ✅ Finished [${table}]: ${successCount} inserted, ${skipCount} skipped (already exists), ${failCount} failed.`);
}

async function runMigration() {
    console.log('================================================================');
    console.log('🚀 Starting Data Migration from Supabase to MS SQL Server');
    console.log(`🎯 Target Tenant ID: ${TARGET_TENANT_ID}`);
    console.log('================================================================');

    const pool = await getPool();

    for (const table of TABLES_ORDERED) {
        await migrateTable(pool, table);
    }

    console.log('\n================================================================');
    console.log('🎉 Data Migration Complete!');
    console.log('================================================================');
    process.exit(0);
}

runMigration().catch(err => {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
});
