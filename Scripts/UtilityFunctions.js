const characterSet1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!:";
const characterSet2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const punctuationSet = ".!:";

app.scrambleText = function (text) {
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

app.randomUppercaseLetter = function() {
   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   var randomIndex = Math.floor(25.99 * Math.random());
   return alphabet.charAt(randomIndex);
}

app.randomPunctuation = function() {
    var randomIndex = Math.floor(2.99 * Math.random());
    return punctuationSet.charAt(randomIndex);
 }

 app.makeRandomLowerCaseText = function(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
  
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * (characters.length - 0.01)));
    }
    return result;
  }
