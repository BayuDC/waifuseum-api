const { body, query, check } = require('express-validator');
const { isMongoId } = require('validator').default;
const validate = require('../middlewares/validate');
const Album = require('../models/album');

const validateAlbum = async (value, { req }) => {
    const isId = isMongoId(value);
    const album = await Album.findOne(isId ? { _id: value } : { $or: [{ name: value }, { slug: value }] });

    if (!album) throw Error('Album does not exist');

    if (
        !(album.community || album.createdBy.toString() == req.user.id || req.user.abilities.includes('manage-picture'))
    ) {
        throw Error('Missing permission to access this album');
    }

    check('album')
        .customSanitizer(() => album)
        .run(req);
};

module.exports = {
    index: validate([
        query('count').toInt(),
        query('page').toInt(),
        query('full')
            .optional()
            .customSanitizer(() => true),
        query('mine')
            .optional()
            .customSanitizer(() => true),
        query('admin')
            .optional()
            .customSanitizer((_, { req }) => {
                return req.user.abilities.includes('picture-admin');
            }),
        query('album').optional().custom(validateAlbum),
    ]),
    store: validate([
        body('source')
            .if(body('source').notEmpty())
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
        body('album').exists().withMessage('Album is required').bail().custom(validateAlbum),
        body('file').custom((_, { req }) => {
            if (!req.file) throw new Error('Picture file is required');
            return true;
        }),
    ]),
    update: [
        body('album').if(body('album').exists()).custom(validateAlbum),
        body('source')
            .if(body('source').notEmpty())
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
    ],
};
