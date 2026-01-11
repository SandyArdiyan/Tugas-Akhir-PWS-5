const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Config
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Folder untuk CSS/Gambar

// Session
app.use(session({
    secret: 'rahasia_dontol_pro',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

// Routes
app.use('/auth', require('./routes/authRoutes'));   // URL: /auth/login
app.use('/admin', require('./routes/adminRoutes')); // URL: /admin
app.use('/', require('./routes/bookRoutes'));       // URL: /

// Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 Server Berjalan di http://localhost:${PORT}`);
});