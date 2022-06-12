const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        source: { type: String, required: false },
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

schema.static('findRandom', async function (query, { count, full }) {
    const pictures = await this.aggregate()
        .match(query)
        .sample(count || 1)
        .project({
            ...{ _id: true, url: true },
            ...(full ? { source: true, album: true } : {}),
        });

    if (full) await this.populate(pictures, { path: 'album' });

    return pictures.map(picture => ({
        id: picture._id,
        url: picture.url,
        source: picture.source,
        album: picture.album,
    }));
});
schema.static('findAll', async function (query, { full, count, page }) {
    const pictures = await this.find(query)
        .select(full ? {} : { album: false, source: false })
        .sort({ createdAt: 'desc' })
        .skip(count * (page - 1))
        .limit(count);

    if (full) {
        await this.populate(pictures, { path: 'album' });
    }

    return pictures;
});
schema.method('update', async function (document) {
    this.source = document.source || this.source;

    await this.save();
    await this.populate('album');
});
schema.method('updateFile', async function (channel, { file, album }) {
    const message = await channel.send({ files: [file?.path || this.url] });
    await message.edit({ content: `\`${this.id}\`` });

    this.messageId = message.id;
    this.album = album?._id || this.album;
});

schema.method('toJSON', function () {
    return {
        ...{ id: this._id, url: this.url, source: this.source },
        ...(this.album ? { album: this.album.toJSON() } : {}),
    };
});
schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Picture', schema);
