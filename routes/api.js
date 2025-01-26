'use strict';
const express = require('express')
const Thread = require('../models/ThreadsAndReplies')
const mongoose = require('mongoose')

module.exports = function (app) {
  
  app.route('/api/threads/:board')
	.post(async (req, res) => {
		let { text, delete_password } = req.body;
		const board = req.params.board;

		let thread = await Thread.create({
			board: board,
			text: text,
			delete_password: delete_password
		});

		return res.sendFile(process.cwd() + '/views/board.html')
	})

	
		
    
  app.route('/api/replies/:board');

};
