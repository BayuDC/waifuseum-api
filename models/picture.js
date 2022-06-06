const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    url: { type: String, required: true },
    source: { type: String, required: false },
    messageId: { type: String, required: true },
    album: { type: mongoose.mongo.ObjectId, ref: 'Album', required: true },
});

module.exports = mongoose.model('Picture', schema);
