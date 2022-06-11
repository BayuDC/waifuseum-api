const Album = require('../models/album');
const Picture = require('../models/picture');
const createError = require('http-errors');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @param {String} id
     */
    async load(req, res, next, id) {
        try {
            const user = req.user;
            const picture = await Picture.findById(id);
            if (!picture) throw createError(404, 'Picture not found');

            await picture.populate('album');
            let canModify, canAccess;

            if (!picture.album.private) canAccess = true;
            if (picture.album.createdBy.toString() == user.id || user.abilities.includes('picture-admin')) {
                (canModify = true), (canAccess = true);
            }

            req.data = { picture, canModify, canAccess };
            next();
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async show(req, res, next) {
        const { picture, canAccess } = req.data;
        try {
            if (!canAccess) throw createError(403, 'You are not allowed to see this picture');

            res.json({ picture: picture.toJSON() });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async index(req, res, next) {
        const { count, full, album, mine } = req.query;

        const albums = await Album.find({
            ...{ private: false },
            ...(album ? { _id: album.id } : {}),
            ...(mine ? { createdBy: req.user.id } : {}),
        });
        const pictures = await Picture.findRandom(
            { album: { $in: albums.map(album => album._id) } },
            { count, full }
            //
        );

        res.json({ pictures });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async indexAll(req, res, next) {
        const { full, count, page, mine, album, admin } = req.query;

        const albums = await Album.find({
            ...(album ? { _id: album.id } : {}),
            ...(!admin ? { private: false } : {}),
            ...(mine ? { createdBy: req.user.id } : {}),
        });
        const pictures = await Picture.findAll(
            { album: { $in: albums.map(album => album._id) } },
            { full, count, page }
        );

        res.json({ pictures });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async store(req, res, next) {
        const { body, file } = req;
        const { album, source } = body;

        try {
            if (album.createdBy.toString() != req.user.id)
                throw createError(403, 'You are not allowed to upload pictures to this album');

            const channel = req.app.dbChannels.get(album.id);

            const picture = await Picture.createAndUpload(channel, {
                file,
                album,
                source,
            });

            res.status(201).json({ picture: picture.toJSON() });
        } catch (err) {
            if (err.name == 'AbortError') {
                err = createError(422, 'Unprocessable file');
            }

            next(err);
        } finally {
            file?.destroy();
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async update(req, res, next) {
        const { album, source } = req.body;
        const { picture, canModify } = req.data;
        const file = req.file;

        try {
            if (!canModify) throw createError(403, 'You are not allowed to update this picture');

            if (album || file) {
                const channel = req.app.dbChannels.get(album?.id || picture.album.id);
                const message = await (album ? req.app.dbChannels.get(picture.album.id) : channel).messages
                    .fetch(picture.messageId)
                    .catch(() => {});

                await picture.updateFile(channel, { file, album });
                await message?.delete();
            }

            await picture.update({ source });

            res.json({ picture: picture.toJSON() });
        } catch (err) {
            if (err.name == 'AbortError') {
                err = createError(422, 'Unprocessable file');
            }

            next(err);
        } finally {
            file?.destroy();
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async destroy(req, res, next) {
        const { picture, canModify } = req.data;

        try {
            if (!canModify) throw createError(403, 'You are not allowed to delete this picture');

            const channel = req.app.dbChannels.get(picture.album.id);
            const message = await channel.messages.fetch(picture.messageId).catch(() => {});

            await Picture.deleteOne(picture);
            await message?.delete();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
