const db = require('../config/database');

exports.formLogin = (req, res) => res.render('login', { error: null });
exports.formRegister = (req, res) => res.render('register', { error: null });

exports.prosesLogin = (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.render('login', { error: 'Database Error' });
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/');
        } else {
            res.render('login', { error: 'Email atau Password Salah' });
        }
    });
};

exports.prosesRegister = (req, res) => {
    const { username, email, password } = req.body;
    db.query('INSERT INTO users (username, email, password, role, balance) VALUES (?, ?, ?, "user", 0)', 
    [username, email, password], (err) => {
        if (err) return res.render('register', { error: 'Gagal Register' });
        res.redirect('/auth/login');
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};