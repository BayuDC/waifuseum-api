const { validationResult } = require('express-validator');
const createError = require('http-errors');

module.exports = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req).formatWith(({ msg }) => msg);

        if (errors.isEmpty()) return next();

        next(createError(400, 'Invalid fields', { details: errors.mapped() }));
    };
};
