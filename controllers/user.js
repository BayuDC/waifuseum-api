const createError = require('http-errors');
const User = require('../models/user');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @param {string} id
     */
    async load(req, res, next, id) {
        try {
            const user = await User.findById(id);
            if (!user) throw undefined;

            req.data = { user };
            next();
        } catch (err) {
            next(createError(404, 'User not found'));
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async index(req, res, next) {
        const { full } = req.query;
        const users = await (full ? User.find() : User.find().select('-abilities'));

        res.json(users);
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    show(req, res, next) {
        const { user } = req.data;
        res.json({ user });
    },
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
