const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        source: { type: String, required: false },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        messageId: { type: String, required: true },
        album: { type: mongoose.mongo.ObjectId, ref: 'Album', required: true },
        createdBy: { type: mongoose.mongo.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    }
);

schema.query.paginate = function (page, count) {
    return this.skip(count * (page - 1)).limit(count);
};

schema.method('toJSON', function () {
    return {
        id: this._id,
        url: this.url,
        source: this.source,
        album: this.album,
        createdBy: this.createdBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
});
schema.pre('find', function (next) {
    const { full } = this.getOptions();

    if (full) {
        this.populate('createdBy', 'name');
        this.populate('album', ['name', 'slug']);
    } else {
        this.select(['url', 'source']);
    }

    this.sort({ createdAt: 'desc' });

    next();
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Picture', schema);
