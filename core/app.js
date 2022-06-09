const express = require('express');
const cookie = require('cookie-parser');
const cors = require('cors');

const error = require('../middlewares/error');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(cookie());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('../routes/main'));
app.use('/auth', require('../routes/auth'));
app.use('/pictures', require('../routes/picture'));
app.use('/albums', require('../routes/album'));

app.use(error.notFound);
app.use(error.handle);

module.exports = bot => {
    app.listen(port, () => {
        console.log('App running at port', port);

        app.dbServer = bot.dbServer;
        app.dbParent = bot.dbParent;
        app.dbChannels = bot.dbChannels;
    });
};
