var markovTwitter = require('../lib/markov-twitter.js');
var useLocalTweets = false;
var state_size = 2;

var options = {
    state_size:state_size,
    numTweetsToPredict: 2
}

var thisMarkovTwitter = new markovTwitter(options);
var tweets = [
    'There was a young man From Cork who got limericks And haikus confused #NationalPoetryDay',
    'O, yes, I say it plain, America never was America to me, And yet I swear this oath—America will be! - Langston Hughes #NationalPoetryDay',
    'War\'s a horrid thing, by S. Baldrick Hear the words I sing War\'s a horrid thing So I sing sing sing ding-a-ling-a-ling #NationalPoetryDay'
]
options.tweets = tweets;
thisMarkovTwitter.generateMarkovTweets(options,function(tweets){
    console.log(tweets)
});