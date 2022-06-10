const User = require('../models/user');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async store(req, res, next) {
        try {
            const { name, email, password, abilities } = req.body;

            const user = await User.create({ name, email, password, abilities });

            res.status(201).send({ user: user.toJSON() });
        } catch (err) {
            next(err);
        }
    },
};
