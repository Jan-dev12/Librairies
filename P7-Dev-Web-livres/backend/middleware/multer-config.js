const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

//sert a construire le nom du ficher avec la bonne extension
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'temp');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage }).single("image");

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err });

    // Si on a pas d'image on passe au controller
    if (!req.file) return next();

    // Nouveau nom optimisé
    const optimizedName = req.file.filename.split(".")[0] + ".webp";
    const outputPath = path.join("images", optimizedName);

    try {
      // Optimisation : resize + compression + WebP
      await sharp(req.file.path)
        .resize({ width: 800 }) // largeur max
        .webp({ quality: 80 })  // compression
        .toFile(outputPath);

      // Supprimer l'image brute
      fs.unlinkSync(req.file.path);

      // Remplacer le nom du fichier dans req.file
      req.file.filename = optimizedName;

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur lors de l'optimisation de l'image" });
    }
  });
};
