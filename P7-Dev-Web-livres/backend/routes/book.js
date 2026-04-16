const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');

const BookCtrl = require('../controllers/book');

router.get('/', auth, BookCtrl.getAllBook);

router.post('/', auth, multer, BookCtrl.createBook);

router.get('/:id', auth, BookCtrl.getOneBook);

router.put('/:id', auth, multer, BookCtrl.modifyBook);

router.delete('/:id', auth, BookCtrl.deleteBook);

module.exports = router;