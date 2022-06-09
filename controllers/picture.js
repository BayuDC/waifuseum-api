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
            const picture = await Picture.findById(id);
            if (!picture) throw undefined;

            await picture.populate('album');
            req.picture = picture;
            next();
        } catch {
            next(createError(404, 'Picture not found'));
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async index(req, res, next) {
        const { count, full, album } = req.query;

        const pictures = await Picture.findRandom({ count, full, album });

        res.json({ pictures });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async indexAll(req, res, next) {
        const { full, album, count, page } = req.query;

        const pictures = await Picture.findAll({ full, album, count, page });

        res.json({ pictures });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async show(req, res, next) {
        const picture = req.picture;

        res.json({ picture: picture.toJSON() });
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
            const channel = req.app.dbChannels.get(album.id);

            const picture = await Picture.createAndUpload(channel, {
                file,
                album,
                source,
            });

            res.status(201).json({ picture: picture.toJSON() });
        } catch (err) {
            if (err.name == 'AbortError') return next(createError(422, 'Unprocessable file'));

            next(createError(400, 'Unknown error'));
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
        const { body, file, picture } = req;
        const { album, source } = body;

        try {
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
            if (err.name == 'AbortError') return next(createError(422, 'Unprocessable file'));

            next(createError(400, 'Unknown error'));
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
        const picture = req.picture;

        try {
            const channel = req.app.dbChannels.get(picture.album.id);
            const message = await channel.messages.fetch(picture.messageId).catch(() => {});

            await Picture.deleteOne(picture);
            await message?.delete();

            res.status(204).send();
        } catch (err) {
            next(createError(400, 'Unknown error'));
        }
    },
};
