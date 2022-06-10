const router = require('express').Router();
const validate = require('../middlewares/validate');
const { guard, gate } = require('../middlewares/auth');

const controller = require('../controllers/user');
const validation = require('../validations/user');

router.use(guard());
router.param('id', controller.load);

router.get('/');
router.get('/:id', gate('user-read'), controller.show);

router.post('/', gate('user-write'), validate(validation.store), controller.store);
router.put('/:id');
router.delete('/:id');

module.exports = router;
