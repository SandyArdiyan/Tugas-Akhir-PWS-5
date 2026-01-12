const db = require('../config/database');
const crypto = require('crypto');

exports.buyBook = (req, res) => {
    // 1. Cek Login
    if (!req.session || !req.session.user) {
        return res.send('<script>alert("Silakan login terlebih dahulu!"); window.location="/auth/login";</script>');
    }

    const userId = req.session.user.id;
    const bookId = req.params.id;

    // 2. Ambil Data Buku
    db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, bookResult) => {
        if (err || bookResult.length === 0) return res.redirect('/');
        const book = bookResult[0];

        // Cek Stok
        if (book.stock <= 0) {
            return res.send('<script>alert("Stok buku habis!"); window.location="/";</script>');
        }

        // 3. Ambil Data User (Cek Saldo Terbaru)
        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResult) => {
            if (err) return res.redirect('/');
            const user = userResult[0];

            // Cek Saldo
            if (user.balance < book.price) {
                return res.send('<script>alert("Saldo tidak cukup! Silakan Top Up."); window.location="/";</script>');
            }

            // --- PROSES TRANSAKSI ---
            const newApiKey = crypto.randomBytes(16).toString('hex');

            // A. Kurangi Saldo & Update API Key User
            db.query('UPDATE users SET balance = balance - ?, api_key = ? WHERE id = ?', 
            [book.price, newApiKey, userId], (err) => {
                if (err) {
                    console.error(err);
                    return res.send('Gagal update saldo');
                }

                // B. Kurangi Stok Buku
                db.query('UPDATE books SET stock = stock - 1 WHERE id = ?', [bookId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.send('Gagal update stok');
                    }

                    // C. Simpan ke Riwayat Transaksi (PENTING UNTUK ADMIN)
                    const insertTrans = 'INSERT INTO transactions (user_id, book_id, amount) VALUES (?, ?, ?)';
                    db.query(insertTrans, [userId, bookId, book.price], (err) => {
                        if (err) console.error('Gagal simpan riwayat:', err);

                        // Update Session agar tampilan saldo langsung berubah
                        req.session.user.balance -= book.price;

                        // D. Tampilkan Struk
                        res.render('struk', {
                            user: req.session.user,
                            book: book,
                            apiKey: newApiKey,
                            date: new Date().toLocaleString('id-ID')
                        });
                    });
                });
            });
        });
    });
};