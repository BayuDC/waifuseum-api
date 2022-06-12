const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createError = require('http-errors');

const secret = process.env.JWT_SECRET;

module.exports = {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) throw createError(404, 'User not found');

            const auth = await user.comparePassword(password);
            if (!auth) throw createError(401, 'Password is incorrect');

            const token = await user.generateToken();

            const accessToken = jwt.sign(user.toJSON(), secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ secret: token }, secret, { expiresIn: '7d' });

            res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 1 });
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

            res.status(201).json({ message: 'Login success' });
        } catch (err) {
            next(err);
        }
    },
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async logout(req, res, next) {
        try {
            await User.findByIdAndUpdate(req.user.id, { token: '' });

            res.clearCookie('access_token');
            res.clearCookie('refresh_token');

            res.status(200).json({ message: 'Logout success' });
        } catch (err) {
            next(err);
        }
    },
};
