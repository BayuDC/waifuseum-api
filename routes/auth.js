const router = require('express').Router();
const validate = require('../middlewares/validate');

const controller = require('../controllers/auth');
const validation = require('../validations/auth');

router.get('/', (req, res) => res.send());
router.get('/me', (req, res) => res.send({ user: req.user }));
router.post('/login', validate(validation.login), controller.login);
router.post('/logout');

module.exports = router;
