const router = require('express').Router();
const { guard, gate, check } = require('../middlewares/auth');

const controller = require('../controllers/tag');
const validation = require('../validations/tag');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/:id', controller.show);

router.use(guard());
router.post('/', validation.store, controller.store);

router.use('/:id', gate(check.own('tag')));
router.put('/:id', validation.update, controller.update);

module.exports = router;
