const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Halaman Home & Search
exports.home = (req, res) => {
    const searchQuery = req.query.q || '';
    
    // Update saldo session dulu biar real-time
    db.query('SELECT balance FROM users WHERE id = ?', [req.session.user.id], (err, userRes) => {
        req.session.user.balance = userRes[0].balance;

        // Ambil Buku
        let sql = 'SELECT * FROM books';
        let params = [];
        if (searchQuery) {
            sql += ' WHERE title LIKE ? OR author LIKE ?';
            params = [`%${searchQuery}%`, `%${searchQuery}%`];
        }

        db.query(sql, params, (err, books) => {
            res.render('index', { 
                books, 
                user: req.session.user, 
                searchQuery 
            });
        });
    });
};

// Proses Beli
exports.buy = (req, res) => {
    const userId = req.session.user.id;
    const bookId = req.params.id;

    db.query('SELECT b.title, b.price, u.balance FROM books b, users u WHERE b.id = ? AND u.id = ?', 
    [bookId, userId], (err, results) => {
        const { title, price } = results[0];
        const { balance } = results[0];

        if (balance < price) return res.send(`<script>alert("Saldo Kurang!"); window.location.href="/";</script>`);

        const apiKey = uuidv4();
        
        // Transaction Logic
        db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [price, userId], () => {
            db.query('UPDATE users SET balance = balance + ? WHERE role = "admin"', [price], () => {
                db.query('INSERT INTO transactions (user_id, book_id, api_key) VALUES (?, ?, ?)', 
                [userId, bookId, apiKey], () => {
                    res.render('success', { 
                        resi: { api_key: apiKey, book_title: title, price: price, date: new Date() },
                        pembeli: req.session.user.username 
                    });
                });
            });
        });
    });
};

exports.topup = (req, res) => {
    db.query('UPDATE users SET balance = balance + ? WHERE id = ?', 
    [req.body.amount, req.session.user.id], () => res.redirect('/'));
};

exports.pageRedeem = (req, res) => res.render('redeem', { result: null, error: null });

exports.processRedeem = (req, res) => {
    db.query('SELECT b.title, b.data_content FROM transactions t JOIN books b ON t.book_id = b.id WHERE t.api_key = ?', 
    [req.body.apiKey], (err, results) => {
        if (results.length > 0) res.render('redeem', { result: results[0], error: null });
        else res.render('redeem', { result: null, error: 'Kode Tidak Valid' });
    });
};