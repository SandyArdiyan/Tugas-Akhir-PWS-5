const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware'); // Pastikan file ini ada
const multer = require('multer');
const path = require('path');

// --- Konfigurasi Multer (Upload Gambar) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Lokasi simpan gambar
    },
    filename: function (req, file, cb) {
        // Nama file unik: timestamp + ekstensi asli
        cb(null, Date.now() + path.extname(file.originalname)) 
    }
});

const fileFilter = (req, file, cb) => {
    // Tolak file jika bukan gambar
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

// Perbaikan: Menggunakan 'cekAdmin' sesuai file asli middleware Anda
router.post('/add', authMiddleware.cekAdmin, upload.single('image'), bookController.addBook);

router.get('/edit/:id', authMiddleware.cekAdmin, bookController.editBookPage);

router.post('/update/:id', authMiddleware.cekAdmin, upload.single('image'), bookController.updateBook);

router.get('/delete/:id', authMiddleware.cekAdmin, bookController.deleteBook);

router.get('/add', authMiddleware.cekAdmin, (req, res) => {
    res.render('add-book'); 
});

module.exports = router;