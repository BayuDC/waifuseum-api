const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = process.env.JWT_SECRET;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auth = async (req, res, next) => {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    try {
        if (accessToken) {
            req.user = jwt.verify(accessToken, secret);
        } else if (refreshToken) {
            const { id } = jwt.verify(refreshToken, secret);
            const user = await User.findById(id);

            if (!user) throw undefined;

            const token = jwt.sign(user.toJSON(), secret, { expiresIn: '1h' });

            res.cookie('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 1 });
            req.user = user.toJSON();
        }

        delete req.user.iat;
        delete req.user.exp;
    } catch {
        req.user = undefined;
    } finally {
        next();
    }
};

module.exports = function () {
    return auth;
};
