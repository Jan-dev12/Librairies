const express = require('express');
const router = express.Router();

const BookCtrl = require('../controllers/book');

router.get('/:id', BookCtrl.getOneBook);

router.get('/', BookCtrl.getAllBook);

router.post('/', BookCtrl.createBook);

router.put('/:id', BookCtrl.modifyBook);

router.delete('/:id', BookCtrl.deleteBook);

module.exports = router;