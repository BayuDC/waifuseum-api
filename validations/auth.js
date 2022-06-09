const { body } = require('express-validator');

module.exports = {
    login: [
        body('email').notEmpty().withMessage('Email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
};
