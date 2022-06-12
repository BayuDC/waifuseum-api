const router = require('express').Router();
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/album');
const validation = require('../validations/album');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/:id', controller.show);

router.use(guard(), gate('manage-album'));

router.post('/', validation.store, controller.store);
router.put('/:id', validation.update, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
