const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = (req, res, next) => {
    const { email, password } = req.body;

    // Validation email
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    // Validation mot de passe
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Mot de passe trop court (min 6 caractères)' });
    }

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
           }
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                   }
                   else
                   {
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                        {userId: user._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                       )
                   });
                    }
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};