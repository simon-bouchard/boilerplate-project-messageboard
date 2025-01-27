'use strict';
const express = require('express')
const Thread = require('../models/ThreadsAndReplies')
const mongoose = require('mongoose')

const app = express()

app.use(express.urlencoded({extended: true}));

module.exports = function (app) {
  
  app.route('/api/threads/:board')
	.post(async (req, res) => {
		let { text, delete_password } = req.body;
		const board = req.params.board

		let thread = await Thread.create({
			board: board,
			text: text,
			delete_password: delete_password
		});

		return res.sendFile(process.cwd() + '/views/board.html')
	})

	.get(async (req, res) => {
		const board = req.params.board		
		let threads = await Thread.aggregate([
			{
				$match: {board: board},
			},
			{$project: {
				text: 1,
				created_on: 1,
				bumped_on: 1,
				replies: {
					$slice: [{
						$map: {
							input: {
								$sortArray: {
									input: '$replies',
									sortBy: { created_on: -1 },
								},
							},
							as: 'reply',
							in: {
								_id: '$$reply._id',
								text: '$$reply.text',
								created_on: '$$reply.created_on'
							},
						},
					  },
					  3,
					],
				},
			},
			},
			{ $sort: { bumped_on: -1 } },
			{ $limit: 10 },
		]);


					
		return res.json(threads)
	})

	.delete(async (req, res) => {

		const { thread_id, delete_password } = req.body;
		
		const thread = await Thread.findOne({_id: thread_id});

		if (!thread) {
			return res.send("thread can't be found, invalud id")
		}

		if (thread.delete_password !== delete_password) {
			return res.send('incorrect password')
		}

		thread.remove()

		return res.send('success')

	})

	.put(async (req, res) => {
		const thread_id = req.body.thread_id;

		try {
			let thread = await Thread.findOneAndUpdate(
				{ _id: thread_id },
				{reported: true}
			)

			return res.send('reported')

		} catch {
			return res.send('Sever error')
		}
	})
    
  app.route('/api/replies/:board')
	.post(async (req, res) => {
		let { text, delete_password, thread_id } = req.body;
		const board = req.params.board;

		let thread = await Thread.findOne({_id: thread_id});

		thread.replies.push({
			text: text,
			delete_password: delete_password
		});

		thread.bumped_on = Date.now();

		thread.save();

		return res.sendFile(process.cwd() + '/views/thread.html')
	})

	.get(async (req, res) => {
		const _id = req.query.thread_id;
		
		const thread = await Thread.findOne(
			{ _id: _id },
			{ 
				'delete_password': 0,
				'reported': 0,
				'__v': 0,
				'board': 0,
				'replies.delete_password': 0,
				'replies.reported': 0,
			}
		);

		return res.json(thread)
	})

	.delete(async (req, res) => {
		const { thread_id, reply_id, delete_password } = req.body;

		const thread = await Thread.findOne({_id: thread_id});

		if (!thread) {
			return res.send('incorrect thread id')
		}

		const reply = thread.replies.id(reply_id);

		if (!reply) {
			return res.send('incorrect reply id')
		}

		if (reply.delete_password !== delete_password) {
			return res.send('incorrect password')
		}

		reply.text = '[deleted]';
		await thread.save();

		return res.send('success')
	})

	.put(async (req, res) => {
		const { thread_id, reply_id } = req.body

		const thread = await Thread.findOne({_id: thread_id });

		if (!thread) {
			return res.send('invalid thread id')
		}

		const reply = thread.replies.id(reply_id);

		if (!reply) {
			return res.send('invalid reply id')
		}

		reply.reported = true;

		await thread.save()

		return res.send('reported')
	})

};
