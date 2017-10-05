var markovText = require('./markov-text.js');
var textParser = require('./text-parse.js');
var fs = require('fs');



function MarkovTwitter(options){
    if(options){
        this.init(options);
    }
}

MarkovTwitter.prototype.init = function(options){
    this.state_size = typeof options.state_size !== 'undefined' ? options.state_size : 2;
}

MarkovTwitter.prototype.generateMarkovTweets = function(options,callback){
    options.tweets = typeof options.tweets !== 'undefined' ? options.tweets : ['Hello World!'];
    options.max_chars = typeof options.max_chars !== 'undefined' ? options.max_chars : 130;
    options.state_size = typeof options.state_size !== 'undefined' ? options.state_size : this.state_size;
    options.numTweetsToPredict = typeof options.numTweetsToPredict !== 'undefined' ? options.numTweetsToPredict : 10;
    options.popularFirstWord = typeof options.popularFirstWord !== 'undefined' ? options.popularFirstWord : false;
    var tweetText = options.tweets.join('\n');
    var thisMarkovText = new markovText();
    thisMarkovText.init({
        text : tweetText,
        state_size : this.state_size,
        corpus : options.tweets
    });
    callback(thisMarkovText.predict(options));
}

module.exports = MarkovTwitter;