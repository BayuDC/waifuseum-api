const router = require('express').Router();

router.param('id');
router.get('/');
router.get('/:id');
router.post('/');
router.put('/:id');
router.delete('/:id');

module.exports = router;
