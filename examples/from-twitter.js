var markovTwitter = require('../lib/markov-twitter.js');
var fs = require('fs');
var useLocalTweets = false;
var state_size = 1;

var options = {
    state_size:state_size,
    numTweetsToPredict: 1,
    popularFirstWord: true
}
var thisMarkovTwitter = new markovTwitter(options);

fs.readFile('text/twitter-nflSundayTicket.txt','utf-8',function(err,text){
    options.tweets = text.split('\n');
    thisMarkovTwitter.generateMarkovTweets(options,function(tweets){
        console.log(tweets)
    });
});
