const router = require('express').Router();
const { guard, gate, can, own } = require('../middlewares/auth');

const controller = require('../controllers/picture');
const validation = require('../validations/picture');
const { upload, download } = require('../middlewares/picture');

router.get('/', validation.index, controller.index);
router.get('/all', validation.index, controller.indexAll);
router.post('/', guard(), upload, download, validation.store, controller.store);

// router.param('id', controller.load);

// router.get('/:id', controller.show);

// router.post('/', [
//     guard(),
//     gate('picture-access'),
//     middleware.upload,
//     middleware.download,
//     validate(validation.store),
//     controller.store,
// ]);
// router.put('/:id', [
//     guard(),
//     gate('picture-access'),
//     middleware.upload,
//     middleware.download,
//     validate(validation.update),
//     controller.update,
// ]);
// router.delete('/:id', guard(), gate('picture-access'), controller.destroy);

module.exports = router;
