const express = require('express')
const mongoose = require('mongoose');
const toobusy = require('toobusy-js')
const saucesRoutes = require('./routes/sauces')
const userRoutes = require('./routes/user')
const path = require('path')
const hpp = require('hpp');
const helmet = require('helmet');
require('dotenv').config()

const app = express()

mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json({ limit: "1kb" }));
app.use(helmet())
app.use(hpp())
app.use((req, res, next) => {
    if(toobusy()) {
        res.send(503, "Désolé je suis actuellemnt occupé.")
    } else {
        next()
    }
})
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes)

module.exports = app