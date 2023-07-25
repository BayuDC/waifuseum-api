const { check, body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const Tag = require('../models/tag');

module.exports = {
    index: validate([
        query('full')
            .optional()
            .customSanitizer(() => true),
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

            if (await Tag.exists({ slug: value })) {
                throw new Error('Slug was taken');
            }

            check('slug')
                .customSanitizer(() => value)
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
            value =
                value ||
                req.body.name
                    ?.toLowerCase()
                    .replace(/\s/g, '-')
                    .replace(/[^a-z0-9\-\_]/g, '');

            if (await Tag.exists({ slug: value })) {
                throw new Error('Slug was taken');
            }

            check('slug')
                .customSanitizer(() => value)
                .run(req);
        }),
    ]),
};
