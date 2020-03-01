const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const User = require('../models/user');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            // create temp array to store campsites that are already favorites
            let alreadyFav = [];
            let allMessage = favorite;
            req.body.forEach(element => {
                if (favorite.campsites.indexOf(element._id) === -1) {
                    favorite.campsites.push(element._id)
                } else {
                    // if campsite is already a favorite, add to array
                    alreadyFav.push(element._id);
                }
            });
            // create message with favorite indo and any campsites that were already favorites
            if(alreadyFav.length !== 0) {
                allMessage = allMessage + `\n\nCampsite(s) ${alreadyFav} already favorite(s)`;
            }
            console.log('allmessage: ', allMessage);
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(allMessage);
                })
                .catch(err => next(err));
        } else {
            Favorite.create({
                user: req.user._id,
                campsites:req.body
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));            
        }
    })
    .catch(err => next(err)); 
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.statusCode(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
                if (favorite.campsites.indexOf(req.params.campsiteId) === -1) {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    res.statusCode = 403;
                    res.end(`Campsite ${req.params.campsiteId} is already a favorite`);
                }
        } else {
            Favorite.create({
                user: req.user._id,
                campsites:req.body
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));            
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        const favIndex = favorite.campsites.indexOf(req.params.campsiteId);
        if (favIndex > -1) {
            favorite.campsites.splice(favIndex, 1);
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 403;
            res.end(`Campsite /favorites/${req.params.campsiteId} was not a favorite`);
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;