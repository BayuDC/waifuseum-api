const { body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const User = require('../models/user');

module.exports = {
    index: validate([
        query('full')
            .if(query('full').exists())
            .customSanitizer(() => 1),
    ]),
    store: validate([
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
    ]),
    update: validate([
        body('name').optional().trim().default(undefined),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Invalid email format')
            .trim()
            .custom(async (value, { req }) => {
                if (req.data.user.email == value) return;
                if (await User.exists({ email: value })) throw new Error('Email already registered');
            }),
        body('abilities').optional().isArray().withMessage('Abilities must be in array format'),
    ]),
};
