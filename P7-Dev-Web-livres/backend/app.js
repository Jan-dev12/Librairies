require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const bookRoutes = require('./routes/book')
const userRoutes = require('./routes/user')

//connexion a la base de donnée MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//middleware CORS, qui permet au frontend et backend de communiquer sans que le navigateur bloque les requêtes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//permet à Express de lire le JSON envoyé
app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;