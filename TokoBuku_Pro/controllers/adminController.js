const db = require('../config/database');

exports.dashboard = (req, res) => {
    const sql = `SELECT t.id, u.username, b.title, t.api_key, t.purchase_date, b.price 
                 FROM transactions t JOIN users u ON t.user_id = u.id JOIN books b ON t.book_id = b.id 
                 ORDER BY t.purchase_date DESC`;
    db.query(sql, (err, transactions) => {
        res.render('admin', { transactions });
    });
};

exports.formAddBook = (req, res) => res.render('add-book');

exports.processAddBook = (req, res) => {
    const { title, author, price, data_content } = req.body;
    db.query('INSERT INTO books (title, author, price, data_content) VALUES (?, ?, ?, ?)', 
    [title, author, price, data_content], () => res.redirect('/'));
};