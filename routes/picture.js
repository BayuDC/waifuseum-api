const router = require('express').Router();
const { store } = require('../controllers/picture');
const { upload } = require('../middlewares/picture');

router.get('/');
router.get('/all');
router.get('/:id');
router.post('/', upload, store);

module.exports = router;
