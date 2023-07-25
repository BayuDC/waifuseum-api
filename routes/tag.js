const router = require('express').Router();

const controller = require('../controllers/tag');
const validation = require('../validations/tag');

router.param('id', controller.load);

router.get('/', validation.index, controller.index);
router.get('/:id', controller.show);

router.post('/', validation.store, controller.store);
router.put('/:id', validation.update, controller.update);

module.exports = router;
