'use strict';

module.exports = function (app) {
  const bcrypt = require('bcrypt');
  const Thread = require('../model.js');
  const sortByUpdatedAt = (a, b)  => (new Date(b.bumpded_on)) - (new Date(a.bumped_on));

  app.route('/api/threads/:board')
    .post(async (req, res) => {
      //create new thread
      
      /*
      let boardName = req.body.board;
      
      let board = await Board.findOne({board: boardName});
      if (!board){
        board = Board.create({board: boardName});
      }
      */
      const pwd = await bcrypt.hash(req.body.delete_password, 10);
      const thread = new Thread({text: req.body.text, delete_password: pwd});
      thread.save();
      res.json(thread);
    })
    .get(async (req, res) => {
      //Viewing the 10 most recent threads with 3 replies each
      /*
      let boardName = req.params.board;
      let board = await Board.findOne({board: boardName});
      if (!board){
        res.send('board not found!');
        return;
      }
      */
      let threads = await Thread.find({}, 'text created_on bumped_on replies').sort({bumped_on: -1}).limit(10).exec();
      //console.log(threads);
      threads = threads.map(t => {
        t.replies = t.replies.sort(sortByUpdatedAt).slice(0,3);
        t.replies = t.replies.map(r => {
          delete r.reported;
          delete r.delete_password;
          return r;
        });
        return t;
      });
      res.json(threads);
    })
    .put(async (req, res) => {
      //reporting a thread (require thread id)
      /*
      let boardName = req.body.board;
      if(!boardName){
        res.send('board required!');
        return;
      }
      let board = await Board.findOne({board: boardName});
      if (!board) {
        res.send('board not found!');
        return;
      }
      */
      const _id = req.body.thread_id;
      let thread = await Thread.findById(_id).exec();
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      thread.reported = true;
      thread.save({ timestamps: false });
     
      res.send("reported");
    })
    .delete(async (req, res) => {
      //delete a thread (require thread id and valid password)
      /*
      let boardName = req.body.board;
      if(!boardName){
        res.send('board required!');
        return;
      }
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      */
      const _id = req.body.thread_id;
      /*
      let thread = board.threads.id(_id);
      if (!thread){ 
        res.send('thread not found!');
        return;
      }
      */
      let thread = await Thread.findById(_id).exec();
      if(!(await bcrypt.compare(req.body.delete_password, thread.delete_password))){
        res.send('incorrect password');
        return;
      }

      Thread.deleteOne({_id: _id});
      res.send('success');

    })
    
  app.route('/api/replies/:board')
    .post(async (req, res) => {
      //create new reply
      /*
      let boardName = req.body.board;
      if(!boardName){
        res.send('board required!');
        return;
      }
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      */
      const _id = req.body.thread_id;
      let thread = await Thread.findById(_id, 'text created_on bumped_on replies').exec();
      if (!thread){ 
        res.send('thread not found!');
        return;
      }
            
      const pwd = await bcrypt.hash(req.body.delete_password, 10);
      thread.replies.push({text: req.body.text, delete_password: pwd});
      //thread.bumped_on = new Date();
      thread.save();
      res.json(thread);
    })
    .get(async (req, res) => {
      //Viewing a single thread with all replies, thread id send as query params _id
      /*
      let boardName = req.params.board;
      let board = await Board.findOne({board: boardName});
      if (!board){
        res.send('board not found!');
        return;
      }
      */
      const _id = req.query.thread_id;
      let thread = await Thread.findById(_id, 'text created_on bumped_on replies').exec();
      if (!thread){ 
        res.send('thread not found!');
        return;
      }
      
      thread.replies = thread.replies.map(r => {
        delete r.reported;
        delete r.delete_password;
        return r;
      });

      res.json(thread);
    })
    .put(async (req, res) => {
      //reporting a reply
      /*
      let boardName = req.body.board;
      if(!boardName){
        res.send('board required!');
        return;
      }
      let board = await Board.findOne({board: boardName});
      if (!board) res.send('board not found!');
      */
      const tid = req.body.thread_id;
      let thread = await Thread.findById(tid).exec();
      if (!thread){ 
        res.send('thread not found!');
        return;
      }

      const _id = req.body.reply_id;
      let reply = thread.replies.id(_id);
      //console.log(thread, reply);
      if (!reply){ 
        res.send('reply not found!');
        return;
      }

      reply.reported = true;
      thread.save({ timestamps: false });
      //console.log(thread);
      res.send("reported");
    })
    .delete(async (req, res) => {
      //delete a reply
      /*
      let boardName = req.body.board;
      if(!boardName){
        res.send('board required!');
        return;
      }
      let board = await Board.findOne({board: boardName});
      if (!board){ 
        res.send('board not found!');
        return;
      }
      */
      const tid = req.body.thread_id;
      let thread = await Thread.findById(tid).exec();
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

      if(!(await bcrypt.compare(req.body.delete_password, reply.delete_password))){
        res.send('incorrect password');
        return;
      }

      reply.text = '[Deleted]';
      thread.save({ timestamps: false });
      res.send('success');

    })

};
