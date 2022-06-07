const router = require('express').Router();
const pictureController = require('../controllers/picture');
const pictureMiddleware = require('../middlewares/picture');
const pictureValidation = require('../validations/picture');

router.get('/');
router.get('/all');
router.get('/:id');
router.post('/', pictureMiddleware.upload, pictureMiddleware.download, pictureValidation, pictureController.store);

module.exports = router;
