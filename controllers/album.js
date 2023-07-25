const { isValidObjectId } = require('mongoose');
const createError = require('http-errors');
const Picture = require('../models/picture');
const Album = require('../models/album');
const User = require('../models/user');
const Tag = require('../models/tag');
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
            await album.populate('picturesCount');
            await album.populate('createdBy', 'name');
            await album.populate('tags', ['name', 'slug']);

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
    async showPics(req, res, next) {
        const { full, page, count } = req.query;
        const { album } = req.data;

        try {
            const pictures = await Picture.find({
                album: album._id,
            })
                .setOptions({ full })
                .paginate(page, count);

            res.json({ pictures });
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
        const { name, alias, description, slug, private, community, tags } = req.body;

        try {
            /** @type {import('discord.js').Guild} guild */
            const guild = req.app.data.server;
            /** @type {import('discord.js').TextChannel} channel */
            const channel = await guild.channels.create('🌸・' + slug, {
                parent: parentId,
                topic: `${alias}${alias && description ? '・' : ''}${description}`,
            });

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
                alias,
                description,
                slug,
                private: community ? false : private,
                community,
                tags,
                channelId: channel.id,
                createdBy: req.user.id,
            });
            await album.syncTags();
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
        const { name, alias, description, slug, tags } = req.body;
        let { album } = req.data;

        try {
            album = await Album.findByIdAndUpdate(album.id, { name, alias, description, slug, tags }, { new: true });
            const channel = await req.app.data.channels.get(album.id);
            await album.syncTags();

            if (slug) {
                await channel.setName('🌸・' + slug);
            }
            if (alias || description) {
                await channel.setTopic(`${alias}${alias && description ? '・' : ''}${description}`);
            }

            res.json({ album: album.toJSON() });
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

            await Tag.updateMany({ _id: { $in: album.tags } }, { $pull: { albums: album.id } });
            await Album.findByIdAndDelete(album.id);
            await channel?.delete();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
