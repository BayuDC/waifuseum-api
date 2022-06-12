const { check, body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const Album = require('../models/album');

module.exports = {
    index: validate([
        query('visibility').optional().trim(),
        query('admin')
            .if(query('admin').exists())
            .customSanitizer((_, { req }) => {
                return req.user.abilities.includes('album-admin');
            }),
    ]),
    store: validate([
        body('name').notEmpty().withMessage('Name is required').trim(),
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
        body('comunity').optional().toBoolean(),
    ]),
    update: validate([
        body('name').optional().trim(),
        body('private').optional().toBoolean(),
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
    ]),
};
