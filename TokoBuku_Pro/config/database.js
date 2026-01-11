const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pameran_buku_db'
});

db.connect((err) => {
    if (err) console.error('❌ Database Error:', err);
    else console.log('✅ Database MySQL Terkoneksi');
});

module.exports = db;