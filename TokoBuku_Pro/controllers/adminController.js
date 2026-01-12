const db = require('../config/database');

exports.dashboard = (req, res) => {
    // Query 1: Ambil Daftar Buku
    const sqlBooks = 'SELECT * FROM books ORDER BY id DESC';
    
    // Query 2: Ambil Riwayat Transaksi (Join dengan tabel users dan books)
    const sqlTransactions = `
        SELECT t.id, u.username, b.title, t.amount, t.created_at 
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
        ORDER BY t.created_at DESC
    `;

    db.query(sqlBooks, (err, books) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }

        db.query(sqlTransactions, (err, transactions) => {
            if (err) {
                console.error(err);
                transactions = []; // Jika error, kirim array kosong
            }

            // Kirim kedua data ke view admin
            res.render('admin', { 
                books: books, 
                transactions: transactions,
                user: req.session.user 
            });
        });
    });
};