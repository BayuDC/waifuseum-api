const { body, query, check } = require('express-validator');
const { isMongoId } = require('validator').default;
const Album = require('../models/album');

module.exports = {
    index: [
        query('count').toInt(),
        query('full')
            .if(query('full').exists())
            .customSanitizer(() => true),
        query('album')
            .if(query('album').exists())
            .custom(async (value, { req }) => {
                const isId = isMongoId(value);

                const album = await Album.findOne(
                    isId
                        ? { _id: value }
                        : {
                              $or: [{ name: value }, { slug: value }],
                          }
                );
                if (!album) {
                    throw Error('Album does not exist');
                }

                check('album')
                    .customSanitizer(() => album)
                    .run(req);
            }),
    ],
    store: [
        body('source')
            .if(body('source').notEmpty())
            .isURL({ protocols: ['http', 'https'] })
            .withMessage('Url is not valid'),
        body('album')
            .exists()
            .withMessage('Allbum name or id is required')
            .bail()
            .custom(async (value, { req }) => {
                const isId = isMongoId(value);

                const album = await Album.findOne(
                    isId
                        ? { _id: value }
                        : {
                              $or: [{ name: value }, { slug: value }],
                          }
                );
                if (!album) {
                    throw Error('Album does not exist');
                }

                check('album')
                    .customSanitizer(() => album)
                    .run(req);
            }),
    ],
};
