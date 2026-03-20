const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync(__dirname + '/full-db-dump.sql', 'utf8')
  .split('\n')
  .filter(line => !line.startsWith('\\'))
  .join('\n');

const client = new Client({
  host: '172.20.200.30',
  port: 5432,
  user: 'appuser',
  password: '1q2w3e',
  database: 'appwebdb01',
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to 172.20.200.30');

    // Drop all tables first with CASCADE
    console.log('Dropping all existing tables...');
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    for (const { tablename } of rows) {
      await client.query(`DROP TABLE IF EXISTS public."${tablename}" CASCADE`);
    }
    console.log(`Dropped ${rows.length} tables`);

    // Drop all sequences
    const seqResult = await client.query(`
      SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    `);
    for (const { sequencename } of seqResult.rows) {
      await client.query(`DROP SEQUENCE IF EXISTS public."${sequencename}" CASCADE`);
    }
    console.log(`Dropped ${seqResult.rows.length} sequences`);

    // Apply the dump (CREATE + INSERT)
    console.log('Applying dump...');
    await client.query(sql);
    console.log('Dump applied successfully!');

    // Verify
    const verify = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    console.log(`Tables created: ${verify.rows.map(r => r.tablename).join(', ')}`);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
  } finally {
    await client.end();
  }
})();
