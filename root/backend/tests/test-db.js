// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.query('SELECT NOW()', (err, res) => {
//   if (err) console.error('DB connection failed:', err);
//   else console.log('DB connection OK:', res.rows);
//   pool.end();
// });

require('dotenv').config({ path: './.env' }); // adjust path if needed

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
