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
    async show(req, res, next) {
        const picture = req.picture;
        await picture.populate('album');

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
            const channel = req.app.albumChannels.get(album.slug);

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
};
