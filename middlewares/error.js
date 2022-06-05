const createError = require('http-errors');

module.exports = {
    notFound(req, res, next) {
        next(createError.NotFound());
    },
    handle(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message || err.statusText || 'Something went wrong',
        });
    },
};
