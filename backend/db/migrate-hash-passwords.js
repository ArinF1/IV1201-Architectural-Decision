/**
 * One-time migration script: hashes plaintext passwords in the live database.
 * Run against Heroku with:
 *   heroku run node db/migrate-hash-passwords.js --app <your-app-name>
 *
 * Safe to run multiple times — it skips rows that are already hashed ($2b$).
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
            ? false
            : { rejectUnauthorized: false } // required for Heroku Postgres
    });

    await client.connect();
    console.log('Connected to database.');

    // Fetch all persons with a non-null, non-hashed password
    const { rows } = await client.query(
        "SELECT person_id, password FROM person WHERE password IS NOT NULL AND password NOT LIKE '$2b$%'"
    );

    if (rows.length === 0) {
        console.log('No plaintext passwords found. Nothing to do.');
        await client.end();
        return;
    }

    console.log(`Found ${rows.length} account(s) with plaintext passwords. Hashing...`);

    for (const row of rows) {
        const hashed = await bcrypt.hash(row.password, SALT_ROUNDS);
        await client.query(
            'UPDATE person SET password = $1 WHERE person_id = $2',
            [hashed, row.person_id]
        );
        console.log(`  person_id=${row.person_id}: hashed OK`);
    }

    console.log('\nDone. All plaintext passwords have been hashed.');
    await client.end();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
