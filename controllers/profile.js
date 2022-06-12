const User = require('../models/user');
const createError = require('http-errors');

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getProfile(req, res) {
        res.json({ user: req.user });
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async updatePassword(req, res, next) {
        try {
            const user = req.user;
            const newPassword = req.body.newPassword;

            user.password = newPassword;
            await user.save();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
