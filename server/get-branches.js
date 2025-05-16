const mysql = require('mysql2/promise');

async function getBranches() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    const [branches] = await conn.query('SELECT id, name FROM branches');
    console.log('支部列表:');
    console.log(JSON.stringify(branches, null, 2));
    
    await conn.end();
  } catch (err) {
    console.error(err);
  }
}

getBranches();
