module.exports = (function(){
    var self = {};
    var config = {
        punctuationRegex: /([\w\.'’&\]\)]+[\.\?!])(\s+(?![a-z\-–—]))/g
    };

    self.getSentences = function(text){
        var currIndex = 0;
        var punctuationRegex = new RegExp(config.punctuationRegex);
        var allSentences = [];
        

        var result,subString,endIndex;
        while(result = punctuationRegex.exec(text)){
            endIndex = result.index+result[0].length - 1;
            subString = text.substring(currIndex,endIndex);
            currIndex = endIndex+1;
            allSentences.push(subString)
        }
        return allSentences;
    }
    self.clean = function(text){
        text = text.replace(/\n/g,' ');
        return text;
    }

    return self;
})()