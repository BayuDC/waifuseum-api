const router = require('express').Router();
const { guard } = require('../middlewares/auth');

const controller = require('../controllers/auth');
const validation = require('../validations/auth');

router.get('/', guard(), (req, res) => res.status(204).send());
router.get('/me', guard(), (req, res) => res.send({ user: req.user }));
router.post('/login', validation.login, controller.login);
router.post('/logout', guard(), controller.logout);

module.exports = router;
