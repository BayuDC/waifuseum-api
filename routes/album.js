const router = require('express').Router();
const { guard, gate, gateIf, check } = require('../middlewares/auth');

const controller = require('../controllers/album');
const validation = require('../validations/album');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/mine', guard(), validation.index, controller.indexMine);
router.get('/all', guard(), gate(check.can('manage-album')), validation.index, controller.indexAll);

router.get('/:id*', [gateIf(({ album }) => album.private, check.own('album'), check.can('manage-album'))]);
router.get('/:id', controller.show);
router.get('/:id/pictures', controller.show);

router.use(guard());
router.post('/', validation.store, controller.store);

router.use('/:id', gate(check.own('album'), check.can('manage-album')));
router.put('/:id', validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
