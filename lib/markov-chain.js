var BEGIN = '__BEGIN__';
var END = '__END__';
var fs = require('fs');
function MarkovChain(options){
    if(options){
        this.init(options);
    }
    this.config = {
        stateSize: 2
    }
}

MarkovChain.prototype.init = function(options){
    this.config.stateSize = typeof options.stateSize  !== 'undefined' ? this.config.stateSize : 2;
    this.markovianModel = this.build(options.corpus,this.config.stateSize);
    this.calculateBeginStates();
}

MarkovChain.prototype.build = function(corpus,stateSize){
    var state,run,items,i,k,follow,endIndex;
    var model = {};
    for( i = 0; i < corpus.length; i++){
        run = corpus[i];
        var beginItems = [];
        for(k = 0; k < stateSize;k++){
            beginItems.push('__BEGIN__');
        }
        items = (beginItems.concat(run));
        items.push('__END__');
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

MarkovChain.prototype.calculateBeginStates = function(){
    var beginState = [];
    for(var i = 0; i < this.config.stateSize; i++){
        beginState.push(BEGIN)
    }
    beginState = beginState.join('');
    var beginningChoices = this.markovianModel[beginState];
    var choices = Object.keys(beginningChoices);
    var weights = [];
    for(var key in beginningChoices){
        weights.push(beginningChoices[key]);
    }
    this.begin_cumdist = this.accumulateWeights(weights);
    this.begin_choices = choices;

}

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

MarkovChain.prototype.move = function(state){
    var choices,cumdist,selection,r;
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
    var min = cumdist[0];
    var max = cumdist[cumdist.length-1];
    r = Math.floor(Math.random()*(max-min+1)+min);
    var bisect = this.bisect(r,cumdist);
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

MarkovChain.prototype.toJson = function () {
    fs.writeFile("./help.txt", JSON.stringify(this.markovianModel), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
};

module.exports = MarkovChain;