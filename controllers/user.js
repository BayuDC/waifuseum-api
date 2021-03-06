const { isValidObjectId } = require('mongoose');
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
            const user = isValidObjectId(id) && (await User.findById(id).simple());
            if (!user) throw createError(404, 'User not found');

            req.data.user = user;
            next();
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    show(req, res) {
        const { user } = req.data;
        res.json({ user });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async index(req, res) {
        const { full } = req.query;
        const users = await (full ? User.find() : User.find().simple());

        res.json(users);
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
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async update(req, res, next) {
        try {
            let { user } = req.data;
            const { name, email, abilities } = req.body;

            user = await User.findByIdAndUpdate(user.id, { name, email, abilities }, { new: true });

            res.json({ user: user.toJSON() });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async destroy(req, res, next) {
        try {
            const { user } = req.data;

            if (user.id == req.user.id) {
                throw createError(409, 'You can not delete yourself');
            }

            await User.findByIdAndDelete(user.id);

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
