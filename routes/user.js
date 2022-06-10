const router = require('express').Router();
const validate = require('../middlewares/validate');
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/user');
const validation = require('../validations/user');

router.use(guard());
router.param('id', controller.load);

router.get('/', gate('user-read'), validate(validation.index), controller.index);
router.get('/:id', gate('user-read'), controller.show);

router.post('/', gate('user-write'), validate(validation.store), controller.store);
router.put('/:id', gate('user-write'), validate(validation.update), controller.update);
router.delete('/:id', gate('user-write'), controller.destroy);

module.exports = router;
