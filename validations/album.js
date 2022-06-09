const { check, body } = require('express-validator');
const Album = require('../models/album');

module.exports = {
    store: [
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
                    .toLowerCase()
                    .replace(/\s/g, '-')
                    .replace(/[^a-z0-9\-\_]/g, '');

            if (await Album.exists({ slug: value })) {
                throw new Error('Slug already exists');
            }

            check('slug')
                .customSanitizer(() => value)
                .run(req);
        }),
    ],
    update: [
        body('name').optional().trim(),
        body('slug')
            .trim()
            .optional()
            .matches(/^[a-z0-9\-\_]+$/i)
            .withMessage('Invalid slug format'),
    ],
};
