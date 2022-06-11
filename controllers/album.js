const createError = require('http-errors');
const Album = require('../models/album');
const User = require('../models/user');
const { worker: workerId, parent: parentId } = require('../config.json');

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
            const album = await Album.findById(id).populate('createdBy');
            if (!album) throw createError(404, 'Album not found');

            if (album.private && !user.abilities.includes('album-admin')) {
                if (album.createdBy.id != user.id) {
                    throw createError(403, 'You are not allowed to access this album');
                }
            }

            req.data = { album };
            next();
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async show(req, res) {
        const { album } = req.data;

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
        const user = req.user;
        const { visibility } = req.query;
        let albums = [];

        switch (visibility) {
            case 'public':
                albums = await Album.find({ private: false }).select('-private');
                break;
            case 'private':
                albums = await Album.find({ private: true, createdBy: user.id }).select('-private');
                break;
            default:
                albums = await Album.find({ $or: [{ private: false }, { createdBy: user.id }] });
        }

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
            /** @type {import('discord.js').Guild} guild */
            const guild = req.app.dbServer;
            /** @type {import('discord.js').TextChannel} channel */
            const channel = await guild.channels.create('🌸・' + slug, { parent: parentId });

            if (private) {
                const ownerId = (await User.findById(req.user.id)).discordId;
                const owner = ownerId ? await guild.members.fetch(ownerId) : undefined;

                await channel.permissionOverwrites.set([
                    ...[
                        { id: guild.id, deny: ['VIEW_CHANNEL'] },
                        { id: workerId, allow: ['VIEW_CHANNEL'] },
                    ],
                    ...(owner ? [{ id: owner.id, allow: ['VIEW_CHANNEL'] }] : []),
                ]);
            }

            const album = await Album.create({ name, slug, private, channelId: channel.id, createdBy: req.user.id });
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
        const { album } = req.data;

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
            const { album } = req.data;

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
