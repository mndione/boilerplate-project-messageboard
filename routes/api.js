'use strict';

module.exports = function (app) {
  const bcrypt = require('bcrypt');
  const Board = require('../model.js');
  const sortByUpdatedAt = (a, b)  => (new Date(b.updatedAt)) - (new Date(a.updatedAt));

  app.route('/api/threads/:board')
    .post(async (req, res) => {
      //create new thread
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board){
        board = Board.create({board: boardName});
      }
      const pwd = await bcrypt.hash(req.body.delete_password, 10);
      board.threads.push({thread: req.body.text, pwd: pwd});
      board.save();
      res.send("thread added!");
    })
    .get(async (req, res) => {
      //Viewing the 10 most recent threads with 3 replies each
      let boardName = req.params.board;
      let board = await Board.findOne({board: boardName});
      if (!board){
        res.send('board not found!');
        return;
      }
      let threads = board.threads.sort(sortByUpdatedAt).slice(0,10);
      threads = threads.map(t => {
        t.replies = t.replies.sort(sortByUpdatedAt).slice(0,3);
        return t;
      });
      res.json(threads);
    })
    .put(async (req, res) => {
      //reporting a thread (require thread id)
      
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board) res.send('board not found!');
      
      const _id = req.body.thread_id;
      let thread = board.threads.id(_id);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      const ipHashed = await bcrypt.hash(req.ip, process.env.REPORT_SALT);
      if(!thread.reports.includes(ipHashed)) {
        thread.reports.push(ipHashed);
        board.save();
      }
      res.send("thread reported!");
    })
    .delete(async (req, res) => {
      //delete a thread (require thread id and valid password)
      //console.log(req.body);
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      
      const _id = req.body.thread_id;
      let thread = board.threads.id(_id);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      if(!(await bcrypt.compare(req.body.delete_password, thread.pwd))){
        res.send('Incorrect password!');
        return;
      }

      thread.thread = '[Deleted]';
      board.save();
      res.send('thread deleted!');

    })
    
  app.route('/api/replies/:board')
    .post(async (req, res) => {
      //create new reply
      
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      
      const _id = req.body.thread_id;
      let thread = board.threads.id(_id);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      if(thread.thread == '[Deleted]'){
        res.send('thread deleted, reply denied!');
        return;
      }

      const pwd = await bcrypt.hash(req.body.delete_password, 10);
      thread.replies.push({reply: req.body.text, pwd: pwd});
      board.save();
      res.send("reply added!");
    })
    .get(async (req, res) => {
      //Viewing a single thread with all replies, thread id send as query params _id
      let boardName = req.params.board;
      let board = await Board.findOne({board: boardName});
      if (!board){
        res.send('board not found!');
        return;
      }

      const _id = req.query._id;
      let thread = board.threads.id(_id);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      res.json(thread);
    })
    .put(async (req, res) => {
      //reporting a reply
      
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board) res.send('board not found!');
      
      const tid = req.body.thread_id;
      let thread = board.threads.id(tid);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      const _id = req.body.reply_id;
      let reply = thread.replies.id(_id);
      if (!reply){ 
        res.send('reply not found!');
        return;
      }

      const ipHashed = await bcrypt.hash(req.ip, process.env.REPORT_SALT);
      if(!reply.reports.includes(ipHashed)) {
        reply.reports.push(ipHashed);
        board.save();
      }
      res.send("reply reported!");
    })
    .delete(async (req, res) => {
      //delete a reply
      
      let boardName = req.body.board;
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      
      const tid = req.body.thread_id;
      let thread = board.threads.id(tid);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      const _id = req.body.reply_id;
      let reply = thread.replies.id(_id);
      if (!reply){ 
        res.send('reply not found!');
        return;
      }

      if(!(await bcrypt.compare(req.body.delete_password, reply.pwd))){
        res.send('Incorrect password!');
        return;
      }

      reply.reply = '[Deleted]';
      board.save();
      res.send('reply deleted!');

    })

};
