/**
 * A Morkov Chain is a system to hop from one state to another. Here is an
 * excellent visual representation of Markov Chains: http://setosa.io/ev/markov-chains/
 * 
 */

var fs = require('fs');
var logger = require('./logger.js');

var BEGIN = '__BEGIN__';
var END = '__END__';

/**
 * Constructor for a new Markov Chain.
 * @param {Object} options 
 * Options include:
 *  stateSize -- Number of state for the chain to consider when predicting the next state.
 *  corpus -- An array of objects to be considered for the Markov Model.
 */

function MarkovChain(options){
    if(options){
        this.init(options);
    }
    this.config = {
        stateSize: 2
    }
}

/**
 * Init function for a new Markov Chain. Stores the model localy as an object
 * @param {Object} options 
 * Options include:
 *  stateSize -- Number of state for the chain to consider when predicting the next state.
 *  corpus -- An array of objects to be considered for the Markov Model.
 */
MarkovChain.prototype.init = function(options){
    logger.log('Initializing Markov Chain');
    this.config.stateSize = typeof options.stateSize  !== 'undefined' ? this.config.stateSize : 2;
    options.corpus = typeof options.corpus  !== 'undefined' ? options.corpus : ['Hello World'];
    this.markovianModel = this.build(options.corpus,this.config.stateSize);
    this.calculateBeginStates();
}

/**
 * Builds a Markov Model given some corpus and state size.
 * @param {Array} corpus 
 * @param {Integer} stateSize
 * @return {Object} model
 */
MarkovChain.prototype.build = function(corpus,stateSize){
    logger.log('Building Markov Chain');
    var state,run,items,i,k,follow,endIndex;
    var model = {};
    for( i = 0; i < corpus.length; i++){
        run = corpus[i];
        var beginItems = [];
        for(k = 0; k < stateSize;k++){
            beginItems.push(BEGIN);
        }
        items = (beginItems.concat(run));
        items.push(END);
        run.push(END);
        for( k = 0; k < run.length; k++){
            endIndex = k + stateSize;
            if(endIndex > items.length -1) endIndex = items.length-1; 
            state = items.slice(k,endIndex).join('');
            follow = items[endIndex];
            if(!model.hasOwnProperty(state)){
                model[state] = {};
            }
            if(!model[state].hasOwnProperty(follow)){
                model[state][follow] = 0;
            }
            model[state][follow] += 1;
        }
    }
    return model;
}

/**
 * Establishes the beginning state of the model and stores it to the object.
 * Reasoning for this is so that while generating multiple outputs, the starting values do not
 * need to be calculated each time. This saves time for larget models.
 * 
 */
MarkovChain.prototype.calculateBeginStates = function(){
    var beginState = [];
    var weights = [];
    var beginningChoices,choices,key,i;

    for(i = 0; i < this.config.stateSize; i++){
        beginState.push(BEGIN)
    }

    beginState = beginState.join('');
    beginningChoices = this.markovianModel[beginState];
    choices = Object.keys(beginningChoices);
    weights = [];
    for(key in beginningChoices){
        weights.push(beginningChoices[key]);
    }
    this.begin_cumdist = this.accumulateWeights(weights);
    this.begin_choices = choices;
}


/**
 * Calcultes the cumulative weights of a given path of the model, essentially the most probable path.
 * @param {Array} array 
 * @return {Array} returnVal
 */
MarkovChain.prototype.accumulateWeights = function(arr){
    var returnVal = [];
    for(var i = 0; i < arr.length; i++){
        var cumulativeValue = 0;
        for(var k = 0; k <= i; k++){
            cumulativeValue = cumulativeValue + arr[k];
        }
        returnVal[i] = cumulativeValue; 
    }
    return returnVal;
}

/**
 * Given some state in the model, calculate the next object that should be taken.
 * @param {Array} state 
 * @return {String} selection
 */

MarkovChain.prototype.move = function(state){
    var choices,cumdist,selection,r,min,max,bisect;
    var beginState = [];
    for(var i = 0; i < this.config.stateSize; i++){
        beginState.push(BEGIN);
    }
    beginState = beginState.join('');
    state = state.join('');
    
    if(state == beginState){
        choices = this.begin_choices;
        cumdist = this.begin_cumdist;
    } else{
        var beginningChoices = this.markovianModel[state];
        if(!beginningChoices) beginningChoices = {};
        choices = Object.keys(beginningChoices);
        var weights = [];
        for(var key in beginningChoices){
            weights.push(beginningChoices[key]);
        }
        cumdist = this.accumulateWeights(weights);
        choices = choices;
    }
    min = cumdist[0];
    max = cumdist[cumdist.length-1];
    r = Math.floor(Math.random()*(max-min+1)+min);
    bisect = this.bisect(r,cumdist);
    selection = choices[bisect];
    return selection;
}

MarkovChain.prototype.bisect = function (val,array) {
    var idx;
    if (array.length === 0) {
        return 0;
    }
    var max = 0;

    for (idx = 0; idx < array.length; idx++) {
        if (val < array[idx]) {
            break;
        } else{
            max = idx;
        }
    }
    return max;
};

/**
 * Given some initial state, generate some output using the built model. If no initial state, use a random beginning state.
 * @param {String} initialState 
 * @return {Array} outArray
 */

MarkovChain.prototype.generate = function (init_state) {
    var state,next_word;
    if(init_state){
        state = init_state;
    } else{
        state = [];
        for(var i = 0; i < this.config.stateSize; i++){
            state.push(BEGIN)
        }
    }
    var outArray = [];
    var i = 0;
    while(true){
        i++;
        next_word = this.move(state);       
        if(next_word == END || next_word == undefined){
            break;
        }
        outArray.push(next_word);
        state = state.slice(1).concat([next_word]);
    }
    return outArray;
};

MarkovChain.prototype.walk = function (init_state) {
    return this.generate(init_state);
};

module.exports = MarkovChain;