const { isValidObjectId } = require('mongoose');
const createError = require('http-errors');
const Album = require('../models/album');
const User = require('../models/user');
const { worker: workerId, parent: parentId } = require('../config.json').bot;

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @param {String} id
     */
    async load(req, res, next, id) {
        try {
            const album = isValidObjectId(id) && (await Album.findById(id));
            if (!album) throw createError(404, 'Album not found');

            req.data.album = album;
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
        const { album } = req.data;
        try {
            if (
                album.private &&
                album.createdBy.toString() != req.user.id &&
                !req.user.abilities.includes('manage-album')
            ) {
                throw createError(403);
            }

            await album.populate('picturesCount');
            await album.populate('createdBy', 'name');

            res.json({ album });
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
        const { full, filter, page, count } = req.query;

        try {
            const albums = await Album.find({
                $or: [{ private: false }, { createdBy: req.user?.id }],
                [filter]: true,
            })
                .setOptions({ full })
                .paginate(page, count);

            res.json({ albums });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async indexMine(req, res, next) {
        const { full, filter, page, count } = req.query;

        try {
            const albums = await Album.find({
                createdBy: req.user.id,
                [filter]: true,
            })
                .setOptions({ full })
                .paginate(page, count);

            res.json({ albums });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async indexAll(req, res, next) {
        const { full, filter, page, count } = req.query;

        try {
            const albums = await Album.find({
                [filter]: true,
            })
                .setOptions({ full })
                .paginate(page, count);

            res.json({ albums });
        } catch (err) {
            next(err);
        }
    },

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async store(req, res, next) {
        const { name, slug, private, community } = req.body;

        try {
            /** @type {import('discord.js').Guild} guild */
            const guild = req.app.data.server;
            /** @type {import('discord.js').TextChannel} channel */
            const channel = await guild.channels.create('🌸・' + slug, { parent: parentId });

            if (private && !community) {
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

            const album = await Album.create({
                name,
                slug,
                private: community ? false : private,
                community,
                channelId: channel.id,
                createdBy: req.user.id,
            });
            req.app.data.channels.set(album.id, channel);

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
        let { album } = req.data;

        try {
            album = await Album.findByIdAndUpdate(album.id, { name, slug }, { new: true });

            if (slug) {
                const channel = await req.app.data.channels.get(album.id);
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
        const { album } = req.data;

        try {
            if (await album.picturesCount) {
                throw createError(409, 'Album is not empty');
            }

            const channel = await req.app.data.channels.get(album.id);

            await Album.findByIdAndDelete(album.id);
            await channel?.delete();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
