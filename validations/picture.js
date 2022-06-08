const { body, query, check } = require('express-validator');
const { isMongoId } = require('validator').default;
const Album = require('../models/album');

const customAlbum = async (value, { req }) => {
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
};

const queryCount = query('count').toInt();
const queryPage = query('page').toInt();
const queryFull = query('full')
    .if(query('full').exists())
    .customSanitizer(() => true);
const queryAlbum = query('album').if(query('album').exists()).custom(customAlbum);

const bodySource = body('source')
    .if(body('source').notEmpty())
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Url is not valid');

const bodyAlbum = body('album').exists().withMessage('Album name or id is required').bail().custom(customAlbum);

module.exports = {
    index: [queryFull, queryCount, queryAlbum],
    indexAll: [queryFull, queryAlbum, queryCount, queryPage],
    store: [bodySource, bodyAlbum],
};
