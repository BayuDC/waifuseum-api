const router = require('express').Router();
const validate = require('../middlewares/validate');
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/user');
const validation = require('../validations/user');

router.use(guard());
router.param('id', controller.load);

router.get('/', gate('manage-user'), validate(validation.index), controller.index);
router.get('/:id', gate('manage-user'), controller.show);

router.post('/', gate('manage-user'), validate(validation.store), controller.store);
router.put('/:id', gate('manage-user'), validate(validation.update), controller.update);
router.delete('/:id', gate('manage-user'), controller.destroy);

module.exports = router;
