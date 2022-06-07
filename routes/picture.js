const router = require('express').Router();
const validate = require('../middlewares/validate');

const pictureController = require('../controllers/picture');
const pictureMiddleware = require('../middlewares/picture');
const pictureValidation = require('../validations/picture');

router.get('/');
router.get('/all');
router.get('/:id');
router.post('/', [
    pictureMiddleware.upload,
    pictureMiddleware.download,
    validate(pictureValidation),
    pictureController.store,
]);

module.exports = router;
