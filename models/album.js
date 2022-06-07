const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    pictures: [{ type: mongoose.mongo.ObjectId, ref: 'Picture' }],
    createdAt: { type: Date, default: Date.now },
});

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        slug: this.slug,
    };
});

module.exports = mongoose.model('Album', schema);
