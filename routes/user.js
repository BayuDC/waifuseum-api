const router = require('express').Router();
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/user');
const validation = require('../validations/user');

router.param('id', controller.load);

router.use(guard(), gate('manage-user'));
router.get('/', validation.index, controller.index);
router.get('/:id', controller.show);
router.post('/', validation.store, controller.store);
router.put('/:id', validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
