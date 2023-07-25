const { check, body, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = {
    index: validate([
        query('full')
            .optional()
            .customSanitizer(() => true),
    ]),
};
