const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- Konfigurasi Penyimpanan Gambar (Multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Gambar akan disimpan di folder public/uploads/
        cb(null, 'public/uploads/') 
    },
    filename: function (req, file, cb) {
        // Memberi nama unik file: timestamp + ekstensi asli
        cb(null, Date.now() + path.extname(file.originalname)) 
    }
});

// Filter File (Hanya gambar)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

// --- Routes ---

// Route Tambah Buku (PENTING: upload.single('image') harus ada)
router.post('/add', authMiddleware.cekAdmin, upload.single('image'), bookController.addBook);

// Route Edit Buku
router.get('/edit/:id', authMiddleware.cekAdmin, bookController.editBookPage);

// Route Update Buku (Termasuk update foto)
router.post('/update/:id', authMiddleware.cekAdmin, upload.single('image'), bookController.updateBook);

// Route Hapus Buku
router.get('/delete/:id', authMiddleware.cekAdmin, bookController.deleteBook);

// Halaman Form Tambah Buku
router.get('/add', authMiddleware.cekAdmin, (req, res) => {
    res.render('add-book'); 
});

module.exports = router;