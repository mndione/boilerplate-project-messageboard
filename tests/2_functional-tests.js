const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Board = require('../model.js');
const bcrypt = require('bcrypt');

chai.use(chaiHttp);

let boardName = 'testboard' + Date.now();
const board = new Board({board: boardName});
const pwd = bcrypt.hashSync('testpwd', 10);
board.threads.push({text: 'test thread 1', delete_password: pwd});
board.threads.push({text: 'test thread 2', delete_password: pwd});
board.save();
thread_delete = board.threads[0];
thread_report = board.threads[1];
thread_report.replies.push({text: 'test reply 1', delete_password: pwd});
thread_report.replies.push({text: 'test reply 2', delete_password: pwd});
board.save();
reply_delete = thread_report.replies[0];
reply_report = thread_report.replies[1];
suite('Functional Tests', function() {
  this.timeout(5000);
  // #1
  test('Creating a new thread', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/threads/' + boardName)
      .send({"board": boardName, "text": "New thread", "delete_password": "pwdt"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'thread added!');
        done();
      });
  });

  // #2
  test('Viewing the 10 most recent threads with 3 replies each', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/threads/' + boardName)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isAtMost(res.body.length, 10);
          assert.isAtMost(res.body[0].replies.length, 3);
          done();
        });
    });

  // #4
  test('Deleting a thread with incorrect pwd', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/threads/' + boardName)
      .send({"board": boardName, "thread_id": thread_delete._id, "delete_password": "test"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // #3
  test('Deleting a thread with a correct pwd', function (done) {
    
    chai
      .request(server)
      .keepOpen()
      .delete('/api/threads/' + boardName)
      .send({"board": boardName, "thread_id": thread_delete._id, "delete_password": "testpwd"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });


  // #5
  test('Reporting a thread', function (done) {
    
    chai
      .request(server)
      .keepOpen()
      .put('/api/threads/' + boardName)
      .send({"board": boardName, "thread_id": thread_report._id})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // #6
  test('Creating a new reply', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/replies/' + boardName)
      .send({"board": boardName, "thread_id":  thread_report._id, "text": "New reply", "delete_password": "pwdr"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reply added!');
        done();
      });
  });

  // #7
  test('Viewing a single thread with all replies', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/replies/' + boardName + '?thread_id=' + thread_report._id)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isAtLeast(res.body.replies.length, 2);
          done();
        });
    });

  // #8
  test('Deleting a reply with the incorrect password', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/replies/' + boardName)
      .send({"board": boardName, "thread_id": thread_report._id, "delete_password": "test", "reply_id": reply_delete._id})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // #9
  test('Deleting a reply with a correct pwd', function (done) {
    
    chai
      .request(server)
      .keepOpen()
      .delete('/api/replies/' + boardName)
      .send({"board": boardName, "thread_id": thread_report._id, "delete_password": "testpwd", "reply_id": reply_delete._id})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });


  // #10
  test('Reporting a reply', function (done) {
    
    chai
      .request(server)
      .keepOpen()
      .put('/api/replies/' + boardName)
      .send({"board": boardName, "thread_id": thread_report._id, "reply_id": reply_report._id})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

});
