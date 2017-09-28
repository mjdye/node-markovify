'use strict';

const log = (msg) => {
	return console.log('node-markovify' + ' :: ' + msg)
}

const err = (msg) => {
	return console.log('node-markovify'+ ' :: error :: ' + msg)
}

module.exports = {
	log : log,
	err : err
}