const User = require('../models/user');

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
    updatePassword(req, res, next) {},
};
