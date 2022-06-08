const router = require('express').Router();
const validate = require('../middlewares/validate');

const pictureController = require('../controllers/picture');
const pictureMiddleware = require('../middlewares/picture');
const pictureValidation = require('../validations/picture');

router.param('id', pictureController.load);

router.get('/', validate(pictureValidation.index), pictureController.index);
router.get('/all', validate(pictureValidation.index), pictureController.indexAll);
router.get('/:id', pictureController.show);
router.post('/', [
    pictureMiddleware.upload,
    pictureMiddleware.download,
    validate(pictureValidation.store),
    pictureController.store,
]);
router.put('/:id', [
    pictureMiddleware.upload,
    pictureMiddleware.download,
    validate(pictureValidation.update),
    pictureController.update,
]);
router.delete('/:id', pictureController.destroy);

module.exports = router;
