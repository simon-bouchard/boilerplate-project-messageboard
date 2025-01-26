const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
	text: {type: String, required: true},
	created_on: {type: Date, default: Date.now},
	reported: {type: Boolean, default: false},
	delete_password: {type: String, required: true}
})

const ThreadSchema = new mongoose.Schema({
	board: {type: String, required: true},
	text: {type: String, required: true},
	created_on: {type: Date, default: Date.now},
	bumped_on: {type: Date, default: Date.now},
	reported: {type: Boolean, default: false},
	delete_password: {type: String, required: true},
	replies: {type: [ReplySchema], default: []}
})

const Thread = mongoose.model('Thread', ThreadSchema)

module.exports = Thread
