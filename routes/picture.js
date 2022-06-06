const router = require('express').Router();

router.get('/');
router.get('/all');
router.get('/:id');
router.post('/');

module.exports = router;
