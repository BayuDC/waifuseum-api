const router = require('express').Router();
const { guard, gate, gateIf, check } = require('../middlewares/auth');

const controller = require('../controllers/picture');
const validation = require('../validations/picture');
const { upload, download } = require('../middlewares/picture');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/mine', guard(), validation.index, controller.indexMine);
router.get('/all', guard(), gate(check.can('manage-picture')), validation.index, controller.indexAll);

router.get('/:id', [
    gateIf(({ picture }) => picture.album.private, check.own('picture'), check.can('manage-picture')),
    controller.show,
]);

router.use(guard());
router.post('/', upload, download, validation.store, controller.store);

router.use('/:id', gate(check.own('picture'), check.can('manage-picture')));
router.put('/:id', upload, download, validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
