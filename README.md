# node-markovify

A Markov Chain module implemented in Node.js. Included functionality supports plain text files as well as arrays of Tweets. For more information on Markov Chains, please visit http://setosa.io/ev/markov-chains/ for an excellent visual explanation.

Functionality is in it's earliest stages and will be upgraded frequently in the coming days.

## <a name="installation"></a>Installation

node-markovify is available on NPM:

```bash
npm install --save node-markovify
```

## <a name="usage"></a>Usage

#### Markov Chain Only
```javascript
var markovChain = require('node-markovify').markovChain;
var thisMarkovChain = new markovChain(options);
```
#### Markov Text Only
```javascript
var markovText = require('node-markovify').markovText;
var thisMarkovText = new markovText(options);
```
#### Markov Twitter Only
```javascript
var markovTwitter = require('node-markovify').markovTwitter;
var thisMarkovTwitter = new markovTwitter(options);
```

## <a name="options"></a>Options Examples
### Markov Text Options
```javascript
var options = {
    state_size : 2
    text: 'Hello World',
    corpus : [
        'Sentence 1',
        'Sentence 2'
    ], // Optional, corpus will be built from options.text if no corpus is passed
    DEFAULT_MAX_OVERLAP_RATIO : .6, // Optional, default .6
    DEFAULT_MAX_OVERLAP_TOTAL : 15, // Optional, default 15
    DEFAULT_TRIES : 100, // Optional, default 100
    BEGIN : '___BEGIN___', // Optional, default ___BEGIN___
    END : '___END___', // Optional, dafault ___END___
}
```

### Markov Twitter Options
```javascript
var options = {
    tweets : [
        'Tweet 1',
        'Tweet 2',
        '...'
    ],
    state_size : 2,
    numTweetsToPredict : 10
}
```


## <a name="Examples"></a>Examples
[Markov Chain using input from a text file](https://github.com/mjdye/node-markovify/blob/master/examples/chain-from-text.js)

[Markov Chain using input from Twitter](https://github.com/mjdye/node-markovify/blob/master/examples/from-twitter.js)

