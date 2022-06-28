const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const User = require('../models/user');

module.exports = {
    password: validate([
        body('oldPassword')
            .notEmpty()
            .withMessage('Current password is required')
            .custom(async (value, { req }) => {
                req.user = await User.findById(req.user.id).select('+password');

                if (!(await req.user.comparePassword(value))) {
                    throw new Error('Current password is incorrect');
                }
            }),
        body('newPassword').notEmpty().withMessage('New password is required'),
    ]),
};
