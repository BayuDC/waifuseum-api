const router = require('express').Router();
const { load, index, show, store, update, destroy } = require('../controllers/album');

router.param('id', load);
router.get('/', index);
router.get('/:id', show);
router.post('/', store);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
