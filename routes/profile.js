const router = require('express').Router();
const { guard } = require('../middlewares/auth');

const controller = require('../controllers/profile');

router.use(guard());
router.get('/', controller.getProfile);
router.patch('/password', controller.updatePassword);

module.exports = router;
