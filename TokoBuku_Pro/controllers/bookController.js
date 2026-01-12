const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Tambah Buku
exports.addBook = (req, res) => {
    const { title, author, price, stock } = req.body;
    const image = req.file ? req.file.filename : 'default.jpg';

    const query = 'INSERT INTO books (title, author, price, stock, image) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, author, price, stock, image], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
};

// Halaman Edit Buku (Tampilkan Form)
exports.editBookPage = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        if (result.length === 0) return res.redirect('/admin');
        res.render('edit-book', { book: result[0] });
    });
};

// Proses Update Buku (Simpan Perubahan)
exports.updateBook = (req, res) => {
    const { id } = req.params;
    const { title, author, price, stock } = req.body;

    let sql = 'UPDATE books SET title=?, author=?, price=?, stock=?';
    let params = [title, author, price, stock];

    // Jika user upload gambar baru
    if (req.file) {
        sql += ', image=? WHERE id=?';
        params.push(req.file.filename, id);
    } else {
        // Jika tidak ganti gambar, pakai gambar lama
        sql += ' WHERE id=?';
        params.push(id);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            res.send('Gagal update database');
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