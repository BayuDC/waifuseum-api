const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        private: { type: Boolean, default: false },
        comunity: { type: Boolean, default: false },
        channelId: { type: String, required: true },
        pictures: [{ type: mongoose.mongo.ObjectId, ref: 'Picture' }],
        createdBy: { type: mongoose.mongo.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    }
);
schema.virtual('picturesCount').get(async function () {
    return await this.model('Picture').countDocuments({ album: this._id });
});

schema.method('toJSON', function () {
    return {
        id: this._id,
        name: this.name,
        slug: this.slug,
        private: this.private,
        comunity: this.comunity,
    };
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Album', schema);
