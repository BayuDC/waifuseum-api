const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

module.exports = router;
