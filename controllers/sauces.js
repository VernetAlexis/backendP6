const ModelsSauce = require('../models/ModelsSauce')
const fs = require('fs')

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const modelsSauce = new ModelsSauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    modelsSauce.save()
        .then(() => res.status(201).json({ message: 'Objet créé' }))
        .catch(error => res.status(400).json({ error }))
}

exports.getAllSauces = (req, res, next) => {
    ModelsSauce.find()
        .then(modelsSauces => res.status(200).json(modelsSauces))
        .catch(error => res.status(400).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
    ModelsSauce.findOne({ _id: req.params.id})
        .then(modelsSauce => res.status(200).json(modelsSauce))
        .catch(error => res.status(400).json({ error }))
}

// exports.modifySauce = (req, res, next) => {
//     const sauceObject = req.file ?
//         { 
//             ...JSON.parse(req.body.sauce),
//             imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
//         } : { ...req.body }
//     ModelsSauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'Objet modifié' }))
//         .catch(error => res.status(400).json({ error }))
// }

exports.modifySauce = (req, res, next) => {
    if (req.file) {
        const sauceObject = { 
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
        ModelsSauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    ModelsSauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié' }))
                        .catch(error => res.status(400).json({ error }))
                })
            })
            .catch(error => res.status(500).json({ error }))
    } else {
        ModelsSauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié' }))
            .catch(error => res.status(400).json({ error }))
    }
}

exports.deleteSauce = (req, res, next) => {
    ModelsSauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                ModelsSauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ messsage: 'Objet Supprimé' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }))
}

exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {
        ModelsSauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: req.body.userId}, $inc: { likes: 1 }})
            .then(() => res.status(200).json({ message: 'J\'aime' }))
            .catch(error => res.status(400).json({ error }))
    } else if (req.body.like === -1) {
        ModelsSauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: req.body.userId}, $inc: { dislikes: 1 }})
            .then(() => res.status(200).json({ message: 'Je n\'aime pas' }))
            .catch(error => res.status(400).json({ error }))
    } else {
        ModelsSauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if(sauce.usersLiked.includes(req.body.userId)) {
                    ModelsSauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId}, $inc: { likes: -1 }})
                        .then(() => res.status(200).json({ message: 'Pas d\'avis' }))
                        .catch(error => res.status(400).json({ error }))
                } else {
                    ModelsSauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId}, $inc: { dislikes: -1 }})
                        .then(() => res.status(200).json({ message: 'Pas d\'avis' }))
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }))
    }
}