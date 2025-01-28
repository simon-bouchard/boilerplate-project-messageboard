const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

	let thread_id, thread_id2, reply_id, reply_id2

	test('Creating a new thread: POST request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.post('/api/threads/test')
			.send({
				text: 'text',
				delete_password: 'delete'
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')

				done();
			})
	})

	test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.get('/api/threads/test')
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.isArray(res.body, 'Response should be an array')
				assert.isObject(res.body[0], 'Response array shohuld contain objects')
				assert.isBelow(res.body.length, 11, 'Response should contain maximum 10 entries')

				assert.property(res.body[0], 'text', 'Response contain a text field')
				assert.property(res.body[0], 'created_on', 'Response contain a created_on field')
				assert.property(res.body[0], 'bumped_on', 'Response contain a bumped_on field')
				assert.property(res.body[0], 'replies', 'Response contain a repliestext field')
				assert.isBelow(res.body[0].replies.length, 4, 'Response replies shuold be at max 3')

				thread_id = res.body[0]._id
				thread_id2 = res.body[1]._id

				done();
			})
	});
	
	test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.delete('/api/threads/test')
			.send({
				thread_id: thread_id,
				delete_password: 'wrong',
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'incorrect password', 'Response should be incorrect password')

				done();
			})
	});

	test('Deleting a thread with the correct password: DELETE request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.delete('/api/threads/test')
			.send({
				thread_id: thread_id,
				delete_password: 'delete'
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'success', 'Response should be success')

				done();
			})
	});

	test('Reporting a thread: PUT request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.put('/api/threads/test')
			.send({
				thread_id: thread_id,
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'reported', 'Response should be reported')

				done();
			})
	});	

	test('creating a new reply: post request to /api/replies/{board}', (done) => {
		chai
			.request(server)
			.post('/api/replies/test')
			.send({
				text: 'text',
				delete_password: 'delete',
				thread_id: thread_id2
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'response status should be 200')

				done();
			})
	})

	test('Viewing a single thread: GET request to /api/replies/{board}?thread_id=', (done) => {
		chai
			.request(server)
			.get(`/api/replies/test?thread_id=${thread_id2}`)
			.end((err, res) => {
				assert.equal(res.status, 200, 'response status should be 200')
				
				assert.isObject(res.body, 'Response array shohuld contain objects')

				assert.property(res.body, 'text', 'Response contain a text field')
				assert.property(res.body, 'created_on', 'Response contain a created_on field')
				assert.property(res.body, 'bumped_on', 'Response contain a bumped_on field')
				assert.property(res.body, 'replies', 'Response contain a repliestext field')
				assert.isArray(res.body.replies, 'Response replies shuold be an array')
				assert.property(res.body.replies[0], 'text', 'Response contain a text field')
				assert.property(res.body.replies[0], '_id', 'Response contain a text field')
				assert.property(res.body.replies[0], 'created_on', 'Response contain a text field')

				reply_id = res.body.replies[0]._id
				done();
			})
	})

	test('Reporting a reply: PUT request to /api/replies/{board}', (done) => {
		chai
			.request(server)
			.put('/api/replies/test')
			.send({
				thread_id: thread_id2,
				reply_id: reply_id
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'reported', 'Response should be reported')

				done();
			})
	});

	test('Deleting a reply with the incorrect password: DELETE request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.delete('/api/replies/test')
			.send({
				thread_id: thread_id2,
				reply_id: reply_id,
				delete_password: 'wrong',
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'incorrect password', 'Response should be incorrect password')

				done();
			})
	});

	test('Deleting a reply with the correct password: DELETE request to /api/threads/{board}', (done) => {
		chai
			.request(server)
			.delete('/api/replies/test')
			.send({
				thread_id: thread_id2,
				reply_id: reply_id,
				delete_password: 'delete'
			})
			.end((err, res) => {
				assert.equal(res.status, 200, 'Response status should be 200')
				assert.equal(res.text, 'success', 'Response should be success')

				done();
			})
	});
});
