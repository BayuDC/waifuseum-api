const { isValidObjectId } = require('mongoose');
const createError = require('http-errors');

const Tag = require('../models/tag');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @param {string} id
     */
    async load(req, res, next, id) {
        try {
            const tag = isValidObjectId(id) && (await Tag.findById(id));
            if (!tag) throw createError(404, 'Tag not found');
            req.data.tag = tag;
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
    async index(req, res, next) {
        const { full } = req.query;
        const tags = await Tag.find().setOptions({ full });

        res.json({ tags });
    },

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async show(req, res, next) {
        const { tag } = req.data;

        await tag.populate('createdBy', 'name');

        res.json({ tag });
    },

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async store(req, res, next) {
        const { name, slug, alias, description } = req.body;
        try {
            const tag = await Tag.create({
                name,
                slug,
                alias,
                description,
                createdBy: req.user.id,
            });

            res.status(201).json({
                tag: tag.toJSON(),
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
        const { name, alias, description, slug } = req.body;
        let { tag } = req.data;

        try {
            tag = await Tag.findByIdAndUpdate(tag.id, { name, alias, description, slug }, { new: true });

            res.json({ tag: tag.toJSON() });
        } catch (err) {
            next(err);
        }
    },
};
