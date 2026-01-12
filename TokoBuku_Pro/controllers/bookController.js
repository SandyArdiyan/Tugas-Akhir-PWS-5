const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Tambah Buku
exports.addBook = (req, res) => {
    const { title, author, price, stock } = req.body;
    
    // Ambil nama file gambar jika ada upload, jika tidak pakai default
    const image = req.file ? req.file.filename : 'default.jpg';

    const sql = 'INSERT INTO books (title, author, price, stock, image) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [title, author, price, stock, image], (err, result) => {
        if (err) {
            console.error(err);
            res.send('Gagal menambah buku');
        } else {
            res.redirect('/admin');
        }
    });
};

// Halaman Edit Buku
exports.editBookPage = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        res.render('edit-book', { book: result[0] });
    });
};

// Update Buku
exports.updateBook = (req, res) => {
    const { id } = req.params;
    const { title, author, price, stock } = req.body;

    let sql = 'UPDATE books SET title=?, author=?, price=?, stock=?';
    let params = [title, author, price, stock];

    // Jika ada gambar baru diupload
    if (req.file) {
        sql += ', image=? WHERE id=?';
        params.push(req.file.filename, id);
    } else {
        sql += ' WHERE id=?';
        params.push(id);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            res.send('Gagal update buku');
        } else {
            res.redirect('/admin');
        }
    });
};

// Hapus Buku
exports.deleteBook = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
};