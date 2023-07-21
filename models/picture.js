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
        toJSON: { virtuals: true },
    }
);

schema.query.paginate = function (page, count) {
    return this.skip(count * (page - 1)).limit(count);
};

schema.method('toJSON', function () {
    return {
        id: this._id,
        url: this.url,
        urls: this.urls,
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
        this.select(['url', 'source', 'width', 'height']);
    }

    this.sort({ createdAt: 'desc' });

    next();
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

schema.method('compress', function (target) {
    if (target > this.width && target > this.height) return '';

    const width = this.width >= this.height ? target : Math.floor((target * this.width) / this.height);
    const height = this.height >= this.width ? target : Math.floor((target * this.height) / this.width);

    return `?width=${width}&height=${height}`;
});

schema.virtual('urls').get(function () {
    const url = this.url.replace('cdn.discordapp.com', 'media.discordapp.net');
    return {
        original: url,
        thumbnail: 'coming soon',
        minimal: `${url}${this.compress(600)}`,
        standard: `${url}${this.compress(1200)}`,
    };
});
module.exports = mongoose.model('Picture', schema);
