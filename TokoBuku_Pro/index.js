const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// KONEKSI DATABASE
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pameran_buku_db'
});

db.connect((err) => {
    if (err) console.error('ERROR DB:', err);
    else console.log('>>> Database MySQL Terkoneksi <<<');
});

// --- AUTHENTICATION ---
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO users (username, email, password, role, balance) VALUES (?, ?, ?, "user", 0)';
    db.query(sql, [username, email, password], (err) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json({ status: 'success', message: 'Register Berhasil!' });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            const user = results[0];
            res.json({
                status: 'success',
                message: 'Login Sukses',
                data: { id: user.id, username: user.username, role: user.role, balance: user.balance }
            });
        } else {
            res.status(401).json({ status: 'error', message: 'Email/Password Salah' });
        }
    });
});

app.get('/users/:id', (req, res) => {
    db.query('SELECT username, balance, role FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// --- FITUR UTAMA ---

// 1. Top Up
app.post('/topup', (req, res) => {
    const { userId, amount } = req.body;
    const sql = 'UPDATE users SET balance = balance + ? WHERE id = ?';
    db.query(sql, [amount, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

// 2. Ambil Buku (DENGAN SEARCH)
app.get('/books', (req, res) => {
    const search = req.query.q;
    let sql = 'SELECT * FROM books';
    let params = [];

    if (search) {
        sql += ' WHERE title LIKE ? OR author LIKE ?';
        params = [`%${search}%`, `%${search}%`];
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 3. Tambah Buku (Admin)
app.post('/books', (req, res) => {
    const { title, author, price, data_content } = req.body;
    const sql = 'INSERT INTO books (title, author, price, data_content) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, author, price, data_content], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

// 4. BELI BUKU (TRANSFER SALDO + DATA RESI)
app.post('/buy', (req, res) => {
    const { userId, bookId } = req.body;

    const sqlCheck = 'SELECT b.title, b.price, u.balance FROM books b, users u WHERE b.id = ? AND u.id = ?';
    db.query(sqlCheck, [bookId, userId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'Data error' });

        const bookTitle = results[0].title;
        const price = results[0].price;
        const userBalance = results[0].balance;

        if (userBalance < price) {
            return res.json({ status: 'failed', message: 'Saldo Tidak Cukup! Top Up dulu.' });
        }

        const newApiKey = uuidv4();
        
        // Logika Transfer: User (-) -> Admin (+) -> Catat
        const sqlPotongUser = 'UPDATE users SET balance = balance - ? WHERE id = ?';
        const sqlTambahAdmin = 'UPDATE users SET balance = balance + ? WHERE role = "admin"';
        const sqlCatat = 'INSERT INTO transactions (user_id, book_id, api_key) VALUES (?, ?, ?)';

        db.query(sqlPotongUser, [price, userId], (err) => {
            if (err) return res.json({ status: 'failed', message: 'Gagal potong saldo' });

            db.query(sqlTambahAdmin, [price], (err) => {
                db.query(sqlCatat, [userId, bookId, newApiKey], (err) => {
                    if (err) return res.json({ status: 'failed', message: 'Gagal catat transaksi' });
                    
                    // KIRIM DATA LENGKAP UTK RESI
                    res.json({ 
                        status: 'success', 
                        message: 'Berhasil', 
                        data: { 
                            api_key: newApiKey,
                            book_title: bookTitle,
                            price: price,
                            date: new Date()
                        } 
                    });
                });
            });
        });
    });
});

// 5. REDEEM (TUKAR KODE UTK BUKA KONTEN)
app.post('/redeem', (req, res) => {
    const { apiKey } = req.body;
    const sql = `SELECT b.title, b.data_content FROM transactions t 
                 JOIN books b ON t.book_id = b.id WHERE t.api_key = ?`;
    db.query(sql, [apiKey], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ status: 'success', data: results[0] });
        } else {
            res.json({ status: 'failed', message: 'API Key Tidak Valid!' });
        }
    });
});

// 6. History Admin
app.get('/admin/transactions', (req, res) => {
    const sql = `SELECT t.id, u.username, b.title, t.api_key, t.purchase_date, b.price 
                 FROM transactions t JOIN users u ON t.user_id = u.id JOIN books b ON t.book_id = b.id 
                 ORDER BY t.purchase_date DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`SERVER BACKEND JALAN DI http://localhost:${PORT}`);
});