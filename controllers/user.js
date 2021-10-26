const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const validator = require('validator')
require('dotenv').config()

exports.signup = (req, res, next) => {
    if (!validator.isStrongPassword(req.body.password)) {
        res.status(400).json({ message: 'Mot de passe trop faible. Votre mot de passe doit contenir au moins: 8 caractères, 1 majuscule, 1 minuscule, 1 chiffres et 1 symbole'})
    } else {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
    }
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ error: 'Utilisateur non touvé' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect'})
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id},
                            process.env.SECRET_TOKEN,
                            { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}