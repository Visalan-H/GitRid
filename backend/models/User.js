const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        sparse: true,
    },
    avatarUrl: {
        type: String
    },
    accessToken: {
        type: String,
        required: true,
        select: false
    },
    deletedRepoCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
