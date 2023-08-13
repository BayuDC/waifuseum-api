const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createError = require('http-errors');
const axios = require('axios');

const config = require('../config.json').app;
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

            const user = await User.findOne({ email }).select('+password +token');
            if (!user) throw createError(404, 'User not found');

            const auth = await user.comparePassword(password);
            if (!auth) throw createError(401, 'Password is incorrect');

            const token = await user.generateToken();

            const accessToken = jwt.sign(user.toJSON(), secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ secret: token }, secret, { expiresIn: '7d' });

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1,
                domain: config.domain,
            });
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
                domain: config.domain,
            });

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
    async loginDiscord(req, res, next) {
        try {
            const { code } = req.body;

            const params = new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                grant_type: 'authorization_code',
                code,
            });

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'application/x-www-form-urlencoded',
            };

            const { data: discordAuth } = await axios.post('https://discord.com/api/oauth2/token', params, {
                headers,
            });
            const { data: discordUser } = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${discordAuth.access_token}`,
                    ...headers,
                },
            });

            let user = await User.findOne({ discordId: discordUser.id }).select('+token');
            if (!user) {
                user = await User.create({
                    name: discordUser.username,
                    email: `${discordUser.username}@waifuseum.art`,
                    discordId: discordUser.id,
                });
            }

            const token = await user.generateToken();

            const accessToken = jwt.sign(user.toJSON(), secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ secret: token }, secret, { expiresIn: '7d' });

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1,
                domain: config.domain,
            });
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
                domain: config.domain,
            });

            res.status(201).json({ message: 'Login success' });
        } catch {
            next(createError(401, 'Login failed'));
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

            res.clearCookie('access_token', { httpOnly: true, domain: config.domain });
            res.clearCookie('refresh_token', { httpOnly: true, domain: config.domain });

            res.status(200).json({ message: 'Logout success' });
        } catch (err) {
            next(err);
        }
    },
};
