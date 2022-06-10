const router = require('express').Router();
const validate = require('../middlewares/validate');
const { guard } = require('../middlewares/auth');

const controller = require('../controllers/album');
const validation = require('../validations/album');

router.param('id', controller.load);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', guard(), validate(validation.store), controller.store);
router.put('/:id', guard(), validate(validation.update), controller.update);
router.delete('/:id', guard(), controller.destroy);

module.exports = router;
