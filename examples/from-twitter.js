var markovTwitter = require('../lib/markov-twitter.js');
var consumer_key = "y2lRfBki6MtorTiNEqZkftYJO";
var consumer_secret = "Z5SVfr6qPYZAIc3E2asaWD33zMTazIPrIIVTaFyyIQETiSLAkT";
var access_token_key = "183662815-gA4MDQMhNIP1ZBHWEMOE5CiBMv8ovH1mpwkLs64t";
var access_token_secret = "NTV6bsdSmGXQT46kQpoMGQHDw9TQjjWshluheDQXx0MzA";
var useLocalTweets = true;
var filters = ' -filter:retweets -filter:media';
var state_size = 2;

var options = {
    consumer_key:consumer_key,
    consumer_secret:consumer_secret,
    access_token_key:access_token_key,
    access_token_secret:access_token_secret,
    useLocalTweets:useLocalTweets,
    state_size:state_size,
    search_string: '#takeaknee' + filters,
    numTweetsToFetch: 5000,
    numTweetsToPredict: 10
}

var thisMarkovTwitter = new markovTwitter(options);
thisMarkovTwitter.generateMarkovTweets(options,function(tweets){
    console.log(tweets)
});



