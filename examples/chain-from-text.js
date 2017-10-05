var markovText = require('../lib/markov-text.js');
var fs = require('fs');

fs.readFile('text/sherlock.txt','utf-8',function(err,text){
    var thisMarkovText = new markovText();
    thisMarkovText.init({
        text:text,
        stateSize:4
    });
    console.log(thisMarkovText.predict({
        init_state:null,
        max_chars:150,
        numberOfSentences:10,
        popularFirstWord: true
    })); 
});

