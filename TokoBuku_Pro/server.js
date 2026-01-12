const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Wajib di-load
const path = require('path');
const db = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

app.set('view engine', 'ejs');

// 1. Middleware Dasar (WAJIB DI ATAS)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Konfigurasi Session (WAJIB SEBELUM ROUTES)
app.use(session({
    secret: 'rahasia_toko_buku_paling_aman', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 Hari
}));

// 3. Global Variable User (Agar bisa dibaca di semua views)
app.use((req, res, next) => {
    // Cek apakah session ada, jika tidak set null
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    next();
});

// 4. Definisi Routes (WAJIB DI BAWAH SESSION)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/books', bookRoutes);
app.use('/transactions', transactionRoutes); // Route beli buku

// Route Top Up
app.post('/topup', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const userId = req.session.user.id;
    const amount = parseInt(req.body.amount);

    if (!amount || amount < 1000) return res.send('<script>alert("Minimal Rp 1.000"); window.location="/";</script>');

    db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId], (err) => {
        if (err) return res.send('Error Top Up');
        req.session.user.balance += amount;
        res.send('<script>alert("Top Up Berhasil!"); window.location="/";</script>');
    });
});

// Halaman Utama
app.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, result) => {
        res.render('index', { books: err ? [] : result });
    });
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});