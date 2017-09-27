var markovTwitter = require('../lib/markov-twitter.js');
var consumer_key = "your_consumer_key_here";
var consumer_secret = "your_consumer_secret_here";
var access_token_key = "your_access_token_here";
var access_token_secret = "your_access_token_secret_here";
var useLocalTweets = false;
var filters = ' -filter:retweets -filter:media';
var state_size = 2;

var options = {
    consumer_key:consumer_key,
    consumer_secret:consumer_secret,
    access_token_key:access_token_key,
    access_token_secret:access_token_secret,
    getLocalTweets:useLocalTweets,
    state_size:state_size,
    search_string: '#takeaknee' + filters,
    numTweetsToFetch: 100,
    numTweetsToPredict: 10
}

var thisMarkovTwitter = new markovTwitter(options);
thisMarkovTwitter.getTweets(options,function(tweets){
    console.log(tweets)
});



