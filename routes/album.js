const router = require('express').Router();
const validate = require('../middlewares/validate');

const controller = require('../controllers/album');
const validation = require('../validations/album');

router.param('id', controller.load);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', validate(validation.store), controller.store);
router.put('/:id', validate(validation.update), controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
