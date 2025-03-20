const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Thread = require('../model.js');
const bcrypt = require('bcrypt');

chai.use(chaiHttp);


const pwd = bcrypt.hashSync('testpwd', 10);

let thread_delete = new Thread({text: 'thread to delete :' + Date.now(), delete_password: pwd});
let thread_report = new Thread({text: 'thread to report :' + Date.now(), delete_password: pwd});;
thread_report.replies.push({text: 'test reply 1', delete_password: pwd});
thread_report.replies.push({text: 'test reply 2', delete_password: pwd});
thread_delete.save();
thread_report.save();
let reply_delete = thread_report.replies[0];
let reply_report = thread_report.replies[1];
suite('Functional Tests', function() {
  this.timeout(5000);
  // #1
  test('Creating a new thread', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/threads/test')
      .send({"text": "New thread", "delete_password": "pwdt"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, 'New thread');
        done();
      });
  });

  // #2
  test('Viewing the 10 most recent threads with 3 replies each', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/threads/test')
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
      .delete('/api/threads/test')
      .send({"thread_id": thread_delete._id, "delete_password": "test"})
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
      .delete('/api/threads/test')
      .send({"thread_id": thread_delete._id, "delete_password": "testpwd"})
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
      .put('/api/threads/test')
      .send({"thread_id": thread_report._id})
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
      .post('/api/replies/test')
      .send({"thread_id":  thread_report._id, "text": "New reply", "delete_password": "pwdr"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isAtLeast(res.body.replies.length, 1);
        done();
      });
  });

  // #7
  test('Viewing a single thread with all replies', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/replies/test?thread_id=' + thread_report._id)
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
      .delete('/api/replies/test')
      .send({"thread_id": thread_report._id, "delete_password": "test", "reply_id": reply_delete._id})
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
      .delete('/api/replies/test')
      .send({"thread_id": thread_report._id, "delete_password": "testpwd", "reply_id": reply_delete._id})
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
      .put('/api/replies/test')
      .send({"thread_id": thread_report._id, "reply_id": reply_report._id})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

});
