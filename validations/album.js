const { check, body, query } = require('express-validator');
const { isMongoId } = require('validator').default;
const validate = require('../middlewares/validate');
const Album = require('../models/album');
const Tag = require('../models/tag');

module.exports = {
    index: validate([
        query('full')
            .optional()
            .customSanitizer(() => true),
        query('filter')
            .optional()
            .matches(/^(private|community)$/)
            .withMessage('Unknown filter option'),
        query('count').default(10).toInt(),
        query('page').default(1).toInt(),
    ]),
    showPics: validate([
        query('full')
            .optional()
            .customSanitizer(() => true),
        query('count').default(10).toInt(),
        query('page').default(1).toInt(),
    ]),
    store: validate([
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('alias').optional().trim(),
        body('description').optional().trim(),
        body('slug')
            .trim()
            .optional()
            .matches(/^[a-z0-9\-\_]+$/i)
            .withMessage('Invalid slug format'),
        body('slug').custom(async (value, { req }) => {
            value =
                value ||
                req.body.name
                    ?.toLowerCase()
                    .replace(/\s/g, '-')
                    .replace(/[^a-z0-9\-\_]/g, '');

            if (await Album.exists({ slug: value })) {
                throw new Error('Slug was taken');
            }

            check('slug')
                .customSanitizer(() => value)
                .run(req);
        }),
        body('private').optional().toBoolean(),
        body('community').optional().toBoolean(),
        body('tags.*')
            .optional()
            .isString()
            .custom(async (value, { req, path }) => {
                const tag = await Tag.findOne(isMongoId(value) ? { _id: value } : { slug: value });

                if (!tag) throw Error('Tag does not exist');

                check(path)
                    .customSanitizer(() => tag._id)
                    .run(req);
            }),
    ]),
    update: validate([
        body('name').optional().trim(),
        body('alias').optional().trim(),
        body('description').optional().trim(),
        body('slug')
            .trim()
            .optional()
            .matches(/^[a-z0-9\-\_]+$/i)
            .withMessage('Invalid slug format'),
        body('slug').custom(async (value, { req }) => {
            if (req.data.album.slug == value) return;
            value =
                value ||
                req.body.name
                    ?.toLowerCase()
                    .replace(/\s/g, '-')
                    .replace(/[^a-z0-9\-\_]/g, '');

            if (await Album.exists({ slug: value })) {
                throw new Error('Slug was taken');
            }

            check('slug')
                .customSanitizer(() => value)
                .run(req);
        }),

        body('tags.*')
            .optional()
            .isString()
            .custom(async (value, { req, path }) => {
                const tag = await Tag.findOne(isMongoId(value) ? { _id: value } : { slug: value });

                if (!tag) throw Error('Tag does not exist');

                check(path)
                    .customSanitizer(() => tag._id)
                    .run(req);
            }),
    ]),
};
