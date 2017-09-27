

var textParser = require('./text-parse.js');
var markovChain = require('./markov-chain.js');

var DEFAULT_MAX_OVERLAP_RATIO = 0.6;
var DEFAULT_MAX_OVERLAP_TOTAL = 15;
var DEFAULT_TRIES = 100;
var BEGIN = '__BEGIN__';
var END = '__END__';


function MarkovText(options){
    if(options){
        this.init(options);
    }
}


MarkovText.prototype.init = function(options){
    //text,stateSize,corpus
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

MarkovText.prototype.getPredictiveText = function(options){
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
        }
        words = prefix.concat(this.thisMarkovChain.walk(options.init_state));
        if(options.max_chars > -1 && words.join(' ').length > options.max_chars) shouldReturnSentence = false;
        if(test_output){
            if(!this.testSentence(words,mor,mot)){
                shouldReturnSentence = false;
            }
        } 
        if(shouldReturnSentence){
            return words.slice(0,words.length-1).join(' ');            
        }
            
    }
    return null;
}


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