var Twitter = require('twitter');
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
    options.state_size = this.state_size;
    this.getLocalTweets = typeof options.getLocalTweets !== 'undefined' ? options.getLocalTweets : false;
    this.consumer_key = typeof options.consumer_key !== 'undefined' ? options.consumer_key : false;
    this.consumer_secret = typeof options.consumer_secret !== 'undefined' ? options.consumer_secret : false;
    this.access_token_key = typeof options.access_token_key !== 'undefined' ? options.access_token_key : false;
    this.access_token_secret = typeof options.access_token_secret !== 'undefined' ? options.access_token_secret : false;

    if(!this.consumer_key || !this.consumer_secret || !this.access_token_key || !this.access_token_secret){
        throw 'You must provide valid twitter credentials.'
    } else{
        this.client = new Twitter({
            consumer_key: this.consumer_key,
            consumer_secret: this.consumer_secret,
            access_token_key: this.access_token_key,
            access_token_secret: this.access_token_secret 
        });
    }   
}

MarkovTwitter.prototype.getTweets = function(options,callback){
    if(this.getLocalTweets){
        this.readLocalTweets(callback);
    } else{
        this.searchTweets(options,callback);
    }
}

MarkovTwitter.prototype.searchTweets = function(options,callback){
    //searchParam,tweetCount
    var rawSearchParam = options.search_string;
    var tweetCount = options.search_string.tweetCount;
    var count;
    var allTweets = [];
    var tweetText = '';
    var allTweetText = [];
    var client = this.client;

    if(tweetCount > 100){
        count = 100; 
    } else{
        count =  tweetCount; 
    }

    function recursiveTweets(max_id){
        var searchObject = {
            q: rawSearchParam,
            count:count
        }
        if(max_id){
            searchObject.max_id = max_id;
        }
        client.get('search/tweets', searchObject, function(error, tweets, response) {
            if(error){
                console.log(error)
                throw(error)
            }
            allTweets = allTweets.concat(tweets.statuses);
            if(tweets.statuses.length == 0){
                callback(tweetText,allTweetText)
            } else {
                if(allTweets.length >= tweetCount || tweets.statuses.length < count){
                    for(var i = 0; i < allTweets.length; i++){
                        tweetText = tweetText + '\n' + textParser.clean(allTweets[i].text);
                        allTweetText.push(textParser.clean(allTweets[i].text));
                    }
                    this.writeTweetsToJson(tweetText,function(){
                        callback(tweetText,allTweetText)
                    });  
                } else{
                    var thisMaxId = tweets.statuses[tweets.statuses.length-1].id; 
                    recursiveTweets(thisMaxId);
                }
            }
            
        });
    }
    recursiveTweets();
}


MarkovTwitter.prototype.generateMarkovTweets = function(options,callback){
    //searchParam,tweetCount,numUniqueTweets
    options.search_string = typeof options.search_string !== 'undefined' ? options.search_string : '#node.js';
    options.numTweetsToFetch = typeof options.numTweetsToFetch !== 'undefined' ? options.numTweetsToFetch : 100;
    options.numTweetsToPredict = typeof options.numTweetsToPredict !== 'undefined' ? options.numTweetsToPredict : 100;
    
    this.getTweets(options,function(tweetText,tweets){
        var thisMarkovText = new markovText();
        thisMarkovText.init({
            text : tweetText,
            state_size : this.state_size,
            corpus : tweets
        });
        callback(thisMarkovText.predict({
            max_chars : 140,
            numberOfSentences : options.numTweetsToPredict
        }));
    })
}

MarkovTwitter.prototype.writeTweetsToJson = function (tweets,callback) {
    fs.writeFile("./twitter.txt", tweets, function(err) {
        if(err) {
            return console.log(err);
        }
        callback();
        
    }); 
};

MarkovTwitter.prototype.readLocalTweets = function (callback) {
    var tweetText = '';
    var allTweetText = [];
    fs.readFile("./twitter.txt", 'utf8',function(err,text) {
        if(err) {
            return console.log(err);
        } else{
            var allTweets = text.split('\n');
            for(var i = 0; i < allTweets.length; i++){
                tweetText = tweetText + '\n' + textParser.clean(allTweets[i]);
                allTweetText.push(textParser.clean(allTweets[i]));
            }
            callback(tweetText,allTweetText)
        }
    }); 
};

module.exports = MarkovTwitter;