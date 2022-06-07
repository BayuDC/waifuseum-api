const fs = require('fs/promises');
const multer = require('multer');
const createError = require('http-errors');

const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };

const handleError = (err, next) => {
    if (err.code == 'LIMIT_FILE_SIZE') return next(createError(413, 'File too large'));
    if (err.code == 'NOT_AN_IMAGE') return next(createError(415, 'File is not an image'));

    next(createError(422, 'Unprocessable file'));
};

module.exports = {
    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    upload(req, res, next) {
        multer({
            dest: './temp/',
            limits: { fileSize: 8 * 1024 * 1024 },
            fileFilter(req, file, cb) {
                if (!formats[file.mimetype]) {
                    return cb(new multer.MulterError('NOT_AN_IMAGE'), false);
                }

                cb(null, true);
            },
        }).single('file')(req, res, async err => {
            if (err) return handleError(err, next);
            if (!req.file) return next();

            const file = req.file;
            const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;

            await fs.rename(file.path, filePath);

            file.path = filePath;
            file.destroy = () => {
                fs.unlink(file.path);
                file.destroy = () => {};
            };

            next();
        });
    },
};
