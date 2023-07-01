const characterSet1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!:";
const characterSet2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const punctuationSet = ".!:";

app.readFileToString = function (fileName) {
    let fileContent = null;
    $.ajax({
        url: fileName,
        async: false,
        success: function (data) {
            fileContent = data;
        },
        error: function (xhr, status, error) {
            console.error(`Failed to read file: ${fileName} (status ${xhr.status})`);
        }
    });
    return fileContent;
}


app.scrambleText = function (text) {
    console.log("ScrambleText: ", text.substr(0, 10));
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
        if (i < 10) {
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

app.RandomChar = function () {
    return characterSet1.charAt(Math.floor(Math.random() * (characterSet1.length - .0)));
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

    // The probability that a string of length n is a Match
    var pOfMatchLookupTable = [];
    pOfMatch = function (n) {
        var pOfPunctuation = 3 / characterSet1.length;
        var pOfLowerCase = 26 / characterSet1.length;
        var pOfUpperCase = 26 / characterSet1.length;
        if (n <= 2)
            return 0;
        if (pOfMatchLookupTable[n] === undefined)
            pOfMatchLookupTable[n] = pOfUpperCase * Math.pow(pOfLowerCase, n - 2) * pOfPunctuation;
        return pOfMatchLookupTable[n];
    }

    /*
    This function computes that probability that a string of length N is a Miss.

    A string of length N is a miss if the first N-1 characters of the string is a Miss
    and it is still a miss when on more character is added.
    */
    var pOfMissLookupTable = [];
    var pOfMiss = function (n) {
        if (n <= 2)
            return 1;
        if (pOfMissLookupTable[n] == undefined)
            pOfMissLookupTable[n] = pOfMiss(n - 1) * (1 - pOfStringEndingWithSubpattern(n - 1) * 3 / 55);
        return pOfMissLookupTable[n];
    }

    /***************************************************************************************************
    
    This function computes the probability that a string of length n will end with a Subpattern.
    Examples of strings of length 4 that end with a Subpattern are these:

    ABCd   ends with Subpattern Cd 
    ABcd   ends with Subpattern Bcd
    Abcd   ends with Subpattern Abcd
        
    Thus the probability that a string of length 4 ends with a subpattern is giving by

    (probility that the string end with a SubPattern of length 2) +
    (probility that the string end with a SubPattern of length 3) +
    (probility that the string end with a SubPattern of length 4)

    Note that this is a geometric sum minus the first two terms
    
    ***************************************************************************************************/
    pOfStringEndingWithSubpattern = function (n) {
        return geometricSum(n, 26 / 55) - 1 - 26 / 55;
    }

    geometricSum = function (n, ratio) {
        var numerator = 1 - Math.pow(ratio, n + 1);
        var denominator = 1 - ratio;
        return numerator / denominator;
    }

