const createError = require('http-errors');
const Album = require('../models/album');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @param {String} id
     */
    async load(req, res, next, id) {
        try {
            const album = await Album.findById(id);
            if (!album) throw undefined;

            req.album = album;
            return next();
        } catch (error) {
            next(createError(404, 'Album not found'));
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async index(req, res) {
        const albums = await Album.find();
        res.json({ albums });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async show(req, res) {
        const album = req.album;

        res.json({
            album: {
                ...album.toJSON(),
                picturesCount: await album.picturesCount,
            },
        });
    },
    store(req, res, next) {},
    update(req, res, next) {},
    destroy(req, res, next) {},
};
