const { randomBytes } = require('crypto');
const { promises: fs, createWriteStream } = require('fs');
const { isURL } = require('validator').default;
const axios = require('axios');
const multer = require('multer');
const createError = require('http-errors');

const size = 8 * 1024 * 1024;
const formats = { 'image/jpeg': 'jpg', 'image/png': 'png' };

const handleError = (err, next) => {
    const httpError = createError(422, 'Unprocessable file');

    switch (err.code) {
        case 'LIMIT_FILE_SIZE':
            httpError.statusCode = 413;
            httpError.details = { file: 'File is too big' };
            break;
        case 'NOT_AN_IMAGE':
            httpError.statusCode = 415;
            httpError.details = { file: 'File is not an image' };
            break;
        case 'NOT_VALID_URL':
            httpError.details = { file: 'File url is not valid' };
    }

    next(httpError);
};
const handleFile = (file, next) => {
    const filePath = `./temp/${file.filename}.${formats[file.mimetype]}`;

    fs.rename(file.path, filePath).then(() => {
        file.path = filePath;
        file.destroy = () => {
            fs.unlink(file.path);
            file.destroy = () => {};
        };

        next();
    });
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
            limits: { fileSize: size },
            fileFilter(req, file, cb) {
                if (!formats[file.mimetype]) {
                    return cb(new multer.MulterError('NOT_AN_IMAGE'), false);
                }

                cb(null, true);
            },
        }).single('file')(req, res, err => {
            if (err) return handleError(err, next);
            if (!req.file) return next();

            handleFile(req.file, next);
        });
    },
    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    download(req, res, next) {
        const url = req.body.fileUrl;

        try {
            if (req.file || !url) return next();
            if (!isURL(url, { protocols: ['http', 'https'] })) {
                throw { code: 'NOT_VALID_URL' };
            }

            const config = { responseType: 'stream' };
            if (url.match(/https?:\/\/i\.pximg\.net/g)) {
                config.headers = { Referer: 'https://pixiv.net' };
            }

            axios
                .head(url, config)
                .then(res => {
                    const file = {
                        type: res.headers['content-type'],
                        size: res.headers['content-length'],
                    };

                    if (!formats[file.type]) throw { code: 'NOT_AN_IMAGE' };
                    if (file.size > size) throw { code: 'LIMIT_FILE_SIZE' };

                    axios
                        .get(url, config)
                        .then(res => {
                            file.name = randomBytes(16).toString('hex');
                            file.path = './temp/' + file.name;

                            res.data.pipe(createWriteStream(file.path));
                            res.data.on('end', () => {
                                req.file = {
                                    path: file.path,
                                    filename: file.name,
                                    mimetype: file.type,
                                };

                                handleFile(req.file, next);
                            });
                        })
                        .catch(err => {
                            handleError(err, next);
                        });
                })
                .catch(err => {
                    handleError(err, next);
                });
        } catch (err) {
            handleError(err, next);
        }
    },
};
