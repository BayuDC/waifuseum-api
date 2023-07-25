const router = require('express').Router();

const controller = require('../controllers/tag');

router.get('/', controller.index);

module.exports = router;
