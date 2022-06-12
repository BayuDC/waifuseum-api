const router = require('express').Router();
const validate = require('../middlewares/validate');
const { guard } = require('../middlewares/auth');

const controller = require('../controllers/profile');
const validation = require('../validations/profile');

router.use(guard());
router.get('/', controller.getProfile);
router.patch('/password', validate(validation.password), controller.updatePassword);

module.exports = router;
