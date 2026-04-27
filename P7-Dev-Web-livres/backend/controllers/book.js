const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

exports.createBook = (req, res, next) => {
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject._userId;
   const book = new Book({
       ...bookObject,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
 
   book.save()
   .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId !== req.auth.userId) {
               return res.status(401).json({ message : 'Not authorized'});
           } else {
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId !== req.auth.userId) {
               res.status(401).json({message: 'Non-autorisé'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               const imagePath = path.join(__dirname, '..', 'images', filename);
               fs.unlink(imagePath, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.getAllBook = (req, res, next) => {
  Book.find()
   .then(book => res.status(200).json(book))
   .catch(error => res.status(400).json({ error }));
}

exports.getBestRating = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.ratingBook = (req, res, next) => {
  const userId = req.auth.userId;
  const rating = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
      }

      // Vérifier si l'utilisateur a déjà noté le livre
      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // Ajoute la note
      book.ratings.push({ userId, grade: rating });

      // Recalcul de la moyenne du livre
      book.averageRating =
        book.ratings.reduce((acc, r) => acc + r.grade, 0) /
        book.ratings.length;

      book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};