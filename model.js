const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI); 

const repliesSchema = new mongoose.Schema(
{reply: String, pwd: String, reports: {type: [String], default: []}},
{timestamps: true,}
);

const threadsSchema = new mongoose.Schema(
{
    thread: String,
    pwd: String,
    replies: {type: [repliesSchema], default: []},
    reports:{type: [String], default: []}
},
{timestamps: true,}
);

const boardSchema = new mongoose.Schema(
{
    board: String,
    threads: {type: [threadsSchema], default: []}
}
);

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;