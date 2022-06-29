const { body, query, check } = require('express-validator');
const { isMongoId } = require('validator').default;
const validate = require('../middlewares/validate');
const Album = require('../models/album');

const validateAlbum = async (value, { req }) => {
    const album = await Album.findOne(isMongoId(value) ? { _id: value } : { slug: value });

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
        query('count').default(10).toInt(),
        query('page').default(1).toInt(),
        query('full')
            .optional()
            .customSanitizer(() => true),
    ]),
    store: validate([
        body('source')
            .optional()
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
        body('album').exists().withMessage('Album is required').bail().custom(validateAlbum),
        body('file').custom((_, { req }) => {
            if (!req.file) throw new Error('Picture file is required');
            return true;
        }),
    ]),
    update: validate([
        body('album').optional().custom(validateAlbum),
        body('source')
            .optional()
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
    ]),
};
