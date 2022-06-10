const { body, query } = require('express-validator');
const User = require('../models/user');

module.exports = {
    index: [
        query('full')
            .if(query('full').exists())
            .customSanitizer(() => 1),
    ],
    store: [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email format')
            .trim()
            .custom(async value => {
                if (await User.exists({ email: value })) throw new Error('Email already registered');
            }),
        body('password').notEmpty().withMessage('Password is required'),
        body('abilities').optional().isArray().withMessage('Abilities must be in array format'),
    ],
};
