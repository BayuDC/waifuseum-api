const router = require('express').Router();
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/picture');
const validation = require('../validations/picture');
const { upload, download } = require('../middlewares/picture');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/all', validation.index, controller.indexAll);
router.get('/:id', controller.show);

router.use(guard());
router.post('/', upload, download, validation.store, controller.store);

router.use('/:id', gate(own('picture'), can('manage-picture')));

router.put('/:id', upload, download, validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
