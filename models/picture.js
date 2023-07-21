const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        urls: {
            base: { type: String, required: true },
            thumbnail: { type: String },
            minimal: { type: String },
            standard: { type: String },
        },
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
        urls: {
            thumbnail: this.urls.base + this.urls.thumbnail,
            minimal: this.urls.base + this.urls.minimal,
            standard: this.urls.base + this.urls.standard,
            original: this.urls.base,
        },
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
        this.select(['url', 'urls', 'source']);
    }

    this.sort({ createdAt: 'desc' });

    next();
});
schema.pre('save', function (next) {
    this.urls.thumbnail = this.generateSize(300);
    this.urls.minimal = this.generateSize(600);
    this.urls.standard = this.generateSize(1200);

    this.updatedAt = Date.now();

    next();
});

schema.method('generateSize', function (target) {
    if (target > this.width && target > this.height) return '';

    const width = this.width <= this.height ? target : Math.floor((target * this.width) / this.height);
    const height = this.height <= this.width ? target : Math.floor((target * this.height) / this.width);

    return `?width=${width}&height=${height}`;
});

module.exports = mongoose.model('Picture', schema);
