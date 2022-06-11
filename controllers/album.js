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
            if (!album) throw createError(404, 'Album not found');

            req.album = album;
            return next();
        } catch (err) {
            next(err);
        }
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
     * @param {import('express').NextFunction} next
     */
    async store(req, res, next) {
        const { name, slug, private } = req.body;

        try {
            const channel = await req.app.dbServer.channels.create('🌸・' + slug);
            await channel.setParent(req.app.dbParent.id);

            const album = await Album.create({
                name,
                slug,
                private,
                channelId: channel.id,
                createdBy: req.user.id,
            });
            req.app.dbChannels.set(album.id, channel);

            res.status(201).json({
                album: album.toJSON(),
            });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async update(req, res, next) {
        const { name, slug } = req.body;
        let album = req.album;

        try {
            album = await Album.findByIdAndUpdate(album.id, { name, slug }, { new: true });

            if (slug) {
                const channel = await req.app.dbChannels.get(album.id);
                await channel.setName('🌸・' + slug);
            }

            res.json({
                album: album.toJSON(),
            });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async destroy(req, res, next) {
        try {
            const album = req.album;
            if (await album.picturesCount) {
                throw createError(409, 'Album is not empty');
            }

            const channel = await req.app.dbChannels.get(album.id);

            await Album.findByIdAndDelete(album.id);
            await channel?.delete();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
