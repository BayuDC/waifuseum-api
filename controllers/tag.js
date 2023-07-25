const Tag = require('../models/tag');

module.exports = {
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
};
