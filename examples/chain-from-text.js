var markovText = require('../lib/markov-text.js');
var fs = require('fs');

fs.readFile('text/sherlock.txt','utf-8',function(err,text){
    
    markovText.init({
        text:text,
        stateSize:4
    });
    console.log(markovText.predict({
        init_state:null,
        max_chars:140,
        numberOfSentences:10
    })); 
});

