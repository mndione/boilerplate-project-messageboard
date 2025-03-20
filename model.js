const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI); 

const repliesSchema = new mongoose.Schema(
{text: String, delete_password: String, reported: {type: Boolean, default: false}},
{timestamps: {createdAt: 'created_on'}}
);

const threadsSchema = new mongoose.Schema(
{
    text: String,
    delete_password: String,
    replies: {type: [repliesSchema], default: []},
    reported: {type: Boolean, default: false}
},
{timestamps: {createdAt: 'created_on', updatedAt: 'bumped_on'}}
);

const boardSchema = new mongoose.Schema(
{
    board: String,
    threads: {type: [threadsSchema], default: []}
}
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;