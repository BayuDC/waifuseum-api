const { body } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = {
    login: validate([
        body('email').notEmpty().withMessage('Email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
};
