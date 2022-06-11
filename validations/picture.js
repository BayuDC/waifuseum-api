const { body, query, check } = require('express-validator');
const { isMongoId } = require('validator').default;
const Album = require('../models/album');

const validateAlbum = async (value, { req }) => {
    const isId = isMongoId(value);
    const album = await Album.findOne(isId ? { _id: value } : { $or: [{ name: value }, { slug: value }] });

    if (!album) throw Error('Album does not exist');
    if (album.createdBy.toString() != req.user.id) throw Error('This album is not your own');

    check('album')
        .customSanitizer(() => album)
        .run(req);
};

module.exports = {
    index: [
        query('count').toInt(),
        query('page').toInt(),
        query('full')
            .if(query('full').exists())
            .customSanitizer(() => true),
        query('mine')
            .if(query('mine').exists())
            .customSanitizer(() => true),
        query('admin')
            .if(query('admin').exists())
            .customSanitizer((_, { req }) => {
                return req.user.abilities.includes('picture-admin');
            }),
        query('album').if(query('album').exists()).custom(validateAlbum),
    ],
    store: [
        body('source')
            .if(body('source').notEmpty())
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
        body('album').exists().withMessage('Album name or id is required').bail().custom(validateAlbum),
        body('file').custom((_, { req }) => {
            if (!req.file) throw new Error('Picture file is required');
            return true;
        }),
    ],
    update: [
        body('album').if(body('album').exists()).custom(validateAlbum),
        body('source')
            .if(body('source').notEmpty())
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
    ],
};
