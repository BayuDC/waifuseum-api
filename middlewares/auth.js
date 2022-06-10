const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const createError = require('http-errors');

const generateAccessToken = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
const generateRefreshToken = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const auth = () => async (req, res, next) => {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    try {
        if (accessToken) {
            req.user = jwt.verify(accessToken, process.env.JWT_SECRET);
        } else if (refreshToken) {
            const { secret } = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const user = await User.findOne({ token: secret });

            if (!user) throw undefined;

            const token = crypto.randomBytes(32).toString('hex');

            user.token = token;
            user.save();

            res.cookie('access_token', generateAccessToken(user.toJSON()), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1,
            });
            res.cookie('refresh_token', generateRefreshToken({ secret: token }), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            req.user = user.toJSON();
        }

        delete req.user.iat;
        delete req.user.exp;
    } catch (err) {
        req.user = undefined;
    } finally {
        next();
    }
};
const guard = () => (req, res, next) => {
    if (!req.user) return next(createError.Unauthorized());

    next();
};
const gate = ability => (req, res, next) => {
    if (!req.user.abilities.includes(ability)) return next(createError.Forbidden());

    next();
};

module.exports = {
    auth,
    guard,
    gate,
};
