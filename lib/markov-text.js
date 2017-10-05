/**
 * Markov text is intended to generate a sentence using a Markov Chain
 * as defined in /lib/markov-chain.js. It will attempt to generate sentences with the model
 * that do not resemble the source too much.
 * 
 */

var textParser = require('./text-parse.js');
var markovChain = require('./markov-chain.js');
var logger = require('./logger.js')

var DEFAULT_MAX_OVERLAP_RATIO = 0.6;
var DEFAULT_MAX_OVERLAP_TOTAL = 10;
var DEFAULT_TRIES = 100;
var BEGIN = '__BEGIN__';
var END = '__END__';


function MarkovText(options){
    if(options){
        this.init(options);
    }
}

/**
 * Init function for MarkovText
 * @param {Object} options 
 * Options include:
 * @param {Integer} options.state_size -- State size for the markov chain
 * @param {String} options.text -- Text that should be considered to build the markov chain
 * @param {Array} options.corpus -- Optional, if not defined, options.text will be used
 * @param {String} options.BEGIN -- Optional, a string setting the beginning of a state
 * @param {Integer} options.DEFAULT_MAX_OVERLAP_RATIO
 * @param {Integer} options.DEFAULT_MAX_OVERLAP_TOTAL
 * @param {Integer} options.DEFAULT_TRIES
 * @param {String} options.END -- Optional, a string setting the end of a state
 */

MarkovText.prototype.init = function(options){
    this.state_size = typeof options.state_size !== 'undefined' ? options.state_size : 2;
    this.text = typeof options.text !== 'undefined' ? textParser.clean(options.text) : 'Hello world! Hello World!';
    this.corpus =  typeof options.corpus === 'object' ? options.corpus :  this.buildCorpus(this.text);
    this.rejoined_text = textParser.clean(this.text);
    this.BEGIN = typeof options.BEGIN !== 'undefined' ? options.BEGIN : BEGIN;
    this.DEFAULT_MAX_OVERLAP_RATIO = typeof options.DEFAULT_MAX_OVERLAP_RATIO !== 'undefined' ? options.DEFAULT_MAX_OVERLAP_RATIO : DEFAULT_MAX_OVERLAP_RATIO;
    this.DEFAULT_MAX_OVERLAP_TOTAL = typeof options.DEFAULT_MAX_OVERLAP_TOTAL !== 'undefined' ? options.DEFAULT_MAX_OVERLAP_TOTAL : DEFAULT_MAX_OVERLAP_TOTAL;
    this.DEFAULT_TRIES = typeof options.DEFAULT_TRIES !== 'undefined' ? options.DEFAULT_TRIES : DEFAULT_TRIES;
    this.END = typeof options.END !== 'undefined' ? options.END : END;

    this.corpusMap = this.corpus.map(function(x){
        return x.split(' ');
    });
    this.thisMarkovChain = new markovChain();
    this.thisMarkovChain.init({corpus:this.corpusMap,stateSize:this.state_size});
}

/**
 * Builds a corpus given some string, essentially an array of sentences.
 * @param {String} text 
 * Options include:
 * @param {Integer} options.state_size -- State size for the markov chain
 * @param {String} options.text -- Text that should be considered to build the markov chain
 */

MarkovText.prototype.buildCorpus = function(text){
    if(typeof text == 'string'){
        return textParser.getSentences(text);
    } else{
        return [];
    }
}

MarkovText.prototype.predict = function(options){
    options.init_state = typeof options.init_state !== 'undefined' ? options.init_state : null;
    options.max_chars = typeof options.max_chars !== 'undefined' ? options.max_chars : -1;
    options.numberOfSentences = typeof options.numberOfSentences !== 'undefined' ? options.numberOfSentences : 5;
    return this.getPredictiveText(options);
}

/**
 * Tries DEFAULT_TRIES times to predict a sentence. Also will predict some set number of sentences.
 * @param {String} text
 */

MarkovText.prototype.getPredictiveText = function(options){
    options.numberOfSentences = options.numberOfSentences !== undefined ? options.numberOfSentences : 10;
    logger.log('Generating',options.numberOfSentences,'Sentences');    
    var tries = this.DEFAULT_TRIES;
    var sentence;
    var allSentences = [];
    for(var sentenceCount = 0; sentenceCount < options.numberOfSentences;sentenceCount++){
        for(var i = 0; i < tries; i++){
            sentence = this.makeSentence(options);
            if(sentence){
                allSentences.push(sentence)
                break;
            }
        }
    }
    return allSentences;
}

/**
 * Makes a sentence using the Markov Chain walk functionality. It will then
 * test the sentence to determine if it is too near to any of the original sentences.
 * 
 * @return {String} A generated sentence
 */


MarkovText.prototype.makeSentence = function(options){
    var tries = this.DEFAULT_TRIES;
    var mor = this.DEFAULT_MAX_OVERLAP_RATIO;
    var mot = this.DEFAULT_MAX_OVERLAP_TOTAL;
    var test_output = typeof options.test_output !== 'undefined' ? options.test_output : true;    
    var prefix,shouldReturnSentence;
    for(var i = 0; i < tries; i++){
        shouldReturnSentence = true;
        if(options.init_state != null){
            if(options.init_state[0] == this.BEGIN){
                prefix = options.init_state.slice(1)
            } else{
                prefix = options.init_state;
            }
        } else{
            prefix = [];
            if(options.popularFirstWord){
                var beginState = '';
                var beginStateArr = [];
                for(var j = 0; j < this.thisMarkovChain.config.stateSize; j++){
                    beginState = beginState + this.BEGIN;
                    beginStateArr.push(this.BEGIN);
                }
                var count = 0;
                var beginWord = '';
                var thisMarkovModel = this.thisMarkovChain.markovianModel[beginState];
                for(var key in thisMarkovModel){
                    if(thisMarkovModel[key] > count){
                        count = thisMarkovModel[key];
                        beginWord = key;
                    }
                }
                beginStateArr[beginStateArr.length - 1] = beginWord;
                prefix = beginStateArr;
                options.init_state = beginStateArr
            }
        }
        words = prefix.concat(this.thisMarkovChain.walk(options.init_state));
        if(options.max_chars > -1 && words.join(' ').length > options.max_chars) shouldReturnSentence = false;
        if(test_output){
            if(!this.testSentence(words,mor,mot)){
                shouldReturnSentence = false;
            }
        } 
        if(shouldReturnSentence){
            return words.slice(0,words.length).join(' ');            
        }
            
    }
    return null;
}

/**
 * Tests a sentence given some ratio of overlap. If the sentence overlaps 
 * too much or is too near to an original sentence, it is rejected.
 * 
 * @param {Array} words
 * @param {decimal} max_overlap_ratio
 * @param {Integer} max_overlap_total
 * 
 */

MarkovText.prototype.testSentence = function(words, max_overlap_ratio, max_overlap_total){
    words = words.slice(0,words.length-1);
    var overlap_ratio = Math.ceil(max_overlap_ratio * (words.length));
    var overlap_max = Math.min(max_overlap_total, overlap_ratio);
    var overlap_over = overlap_max + 1;
    var gram_count = Math.max(((words.length) - overlap_max), 1);
    var grams = [];
    for(var i = 0; i < gram_count; i++){
        var endIndex = i + overlap_over; 
        if(endIndex > words.length){
            endIndex = words.length - 1;
        }
        grams.push(words.slice(i,endIndex));
    }
    for(var i = 0; i < grams.length; i++){
        var g = grams[i];
        var joined = g.join(' ');
        if(this.rejoined_text.indexOf(joined) > -1){            
            return false;
        }
    }
    return true;
}

module.exports = MarkovText;