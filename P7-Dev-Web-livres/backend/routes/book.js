const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const BookCtrl = require('../controllers/book');

router.get('/', auth, BookCtrl.getAllBook);

router.post('/', auth, BookCtrl.createBook);

router.get('/:id', auth, BookCtrl.getOneBook);

router.put('/:id', auth, BookCtrl.modifyBook);

router.delete('/:id', auth, BookCtrl.deleteBook);

module.exports = router;