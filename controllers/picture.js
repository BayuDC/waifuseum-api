const Picture = require('../models/picture');
const createError = require('http-errors');

module.exports = {
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
