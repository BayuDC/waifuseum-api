module.exports = {
    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    store(req, res, next) {
        req.file?.destroy();
        res.send();
    },
};
