const router = require('express').Router();
const { store } = require('../controllers/picture');
const { upload, download } = require('../middlewares/picture');

router.get('/');
router.get('/all');
router.get('/:id');
router.post('/', upload, download, store);

module.exports = router;
