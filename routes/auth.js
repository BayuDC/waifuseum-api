const router = require('express').Router();

router.get('/');
router.get('/me');
router.post('/login');
router.post('/logout');

module.exports = router;
