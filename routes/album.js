const router = require('express').Router();
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/album');
const validation = require('../validations/album');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/mine', guard(), validation.index, controller.indexMine);
router.get('/all', guard(), gate(gate.can('manage-album')), controller.indexAll);
router.get('/:id', controller.show);

router.use(guard());
router.post('/', validation.store, controller.store);

router.use('/:id', gate(gate.own('album'), gate.can('manage-album')));
router.put('/:id', validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
