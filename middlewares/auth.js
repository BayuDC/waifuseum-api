const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createError = require('http-errors');

const config = require('../config.json').app;
const secret = process.env.JWT_SECRET;

const auth = () => async (req, res, next) => {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    try {
        if (accessToken) {
            req.user = jwt.verify(accessToken, secret);
        } else if (refreshToken) {
            const payload = jwt.verify(refreshToken, secret);
            const user = await User.findOne({ token: payload.secret }).select('+token');

            if (!user) throw undefined;

            const token = await user.generateToken();

            const accessTokenNew = jwt.sign(user.toJSON(), secret, { expiresIn: '1h' });
            const refreshTokenNew = jwt.sign({ secret: token }, secret, { expiresIn: '7d' });

            res.cookie('access_token', accessTokenNew, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1,
                domain: config.domain,
            });
            res.cookie('refresh_token', refreshTokenNew, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
                domain: config.domain,
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
const gate =
    (...gates) =>
    (req, res, next) => {
        gates.forEach(gate => gate(req, res));

        if (req.data.access) return next();
        next(createError.Forbidden());
    };

gate.can = ability => (req, res) => {
    req.data.access ||= req.user.abilities.includes(ability);
};
gate.own = property => (req, res) => {
    req.data.access ||= req.data[property]?.createdBy.toString() == req.user.id;
};

module.exports = { auth, guard, gate };
