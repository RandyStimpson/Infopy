const characterSet1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!:";
const characterSet2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const punctuationSet = ".!:";

app.scrambleText = function (text) {
    console.log("ScrambleText: ", text.substr(0,10));
    var scrambledText = "";
    var i;
    var randomIndex;
    var leftText;
    var rightText;
    var leftoverText = text;

    for (i = 1; i <= text.length; i++) {
        //Pick a random character out of leftoverText and append it to scrambledText
        randomIndex = Math.floor(Math.random() * leftoverText.length);
        leftText = leftoverText.substr(0, randomIndex);
        rightText = leftoverText.substr(randomIndex + 1, leftoverText.length - randomIndex - 1);
        scrambledText += leftoverText.substr(randomIndex, 1);
        leftoverText = leftText + rightText;
        if (i<10) {
            console.log(scrambledText);
        }
    }

    return scrambledText;
}

app.orderText = function (text) {
    var i;
    var txt = [];
    for (i = 0; i < text.length; i++) {
        txt[i] = text.substr(i, 1);
    }
    txt.sort();
    result = "";
    for (i = 0; i < text.length; i++) {
        result += txt[i];
    }
    return result;
}

app.makeRandomText = function (length, characterSet) {
    var i;
    var s = "";
    for (i = 1; i <= length; i++) {
        randomIndex = Math.floor((characterSet.length - 0.01) * Math.random());
        randomChar = characterSet.substr(randomIndex, 1);
        s += randomChar;
    }
    return s;
}

app.randomUppercaseLetter = function () {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var randomIndex = Math.floor(25.99 * Math.random());
    return alphabet.charAt(randomIndex);
}

app.randomPunctuation = function () {
    var randomIndex = Math.floor(2.99 * Math.random());
    return punctuationSet.charAt(randomIndex);
}

app.makeRandomLowerCaseText = function (length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * (characters.length - 0.01)));
    }
    return result;
}

app.getPunctuationDelimitedSegment = function (text, start) {

    var end = start;
    do {
        var ch = text.substr(end, 1);
        end++;
    } while ((end < text.length) && (punctuationSet.indexOf(ch) == -1))
    return text.substr(start, end - start);
}

// Split a segment into a miss part and a match part
app.splitSegment = function (segment) {
    var result = {};
    var i;

    // If segment is only 2 characters long the whole thing is a miss
    if (segment.length <= 2) {
        result.miss = segment;
        result.match = "";
    }

    // If the segment doesn't end with a punctuation mark the whole thing is a miss
    else if (punctuationSet.indexOf(segment.slice(-1)) == -1) {
        result.miss = segment;
        result.match = "";
    } else {
        //Find the index of the first uppercase character of the string going backwards
        var index = segment.length - 1;
        do {
            index--;
            var ch = segment.charAt(index);
        } while ((index >= 0) && (ch === ch.toLowerCase()));

        if ((index < 0) || (index == segment.length - 2)) {
            result.miss = segment;
            result.match = "";
        } else {
            result.miss = segment.substr(0, index);
            result.match = segment.substr(index);
        }
    }
    return result;
}

