const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const createError = require('http-errors');

const generateAccessToken = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
const generateRefreshToken = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

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
            if (!user) return next(createError(404, 'User not found'));

            const auth = await bcrypt.compare(password || '', user.password);
            if (!auth) return next(createError(401, 'Password is incorrect'));

            const token = crypto.randomBytes(32).toString('hex');

            const accessToken = generateAccessToken(user.toJSON());
            const refreshToken = generateRefreshToken({ secret: token });

            user.token = token;
            await user.save();

            res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 1 });
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

            res.status(201).json({
                message: 'Login success',
            });
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
        const user = req.user;
        await User.findByIdAndUpdate(user.id, { token: '' });

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.status(200).json({
            message: 'Logout success',
        });
    },
};
