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
            const picture = await Picture.findById(id);
            if (!picture) throw createError(404, 'Picture not found');

            await picture.populate('album');
            req.data.picture = picture;

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
        const { picture } = req.data;
        try {
            if (
                picture.album.private &&
                picture.createdBy.toString() != req.user.id &&
                !req.user.abilities.includes('manage-album')
            ) {
                throw createError(403);
            }

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
        const { body, file, user } = req;
        const { album, source } = body;

        try {
            const channel = req.app.data.channels.get(album.id);
            const message = await channel.send({ files: [file.path] });

            const attachment = message.attachments.first();

            const picture = await Picture.create({
                url: attachment.url,
                width: attachment.width,
                height: attachment.height,
                messageId: message.id,
                createdBy: user.id,
                album: album.id,
                source,
            });

            await message.edit({ content: `\`${picture.id}\`` });

            res.status(201).json({ picture });
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
        const { picture } = req.data;
        const file = req.file;

        try {
            if (album || file) {
                const channel = req.app.data.channels.get(album?.id || picture.album.id);
                const oldMessage = await (album ? req.app.data.channels.get(picture.album.id) : channel).messages
                    .fetch(picture.messageId)
                    .catch(() => {});

                const newMessage = await channel.send({ files: [file?.path || picture.url] });
                const attachment = newMessage.attachments.first();
                await newMessage.edit({ content: `\`${picture.id}\`` });

                picture.url = attachment.url;
                picture.messageId = newMessage.id;
                picture.width = attachment.width || picture.width;
                picture.height = attachment.height || picture.height;
                picture.album = album?.id || picture.album.id;

                await oldMessage?.delete();
            }

            picture.source = source || picture.source;
            await picture.save();

            res.json({ picture });
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
        const { picture } = req.data;

        try {
            const channel = req.app.data.channels.get(picture.album.id);
            const message = await channel.messages.fetch(picture.messageId).catch(() => {});

            await Picture.deleteOne(picture);
            await message?.delete();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
