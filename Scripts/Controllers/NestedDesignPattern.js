/**************************************************************************************************************

    This moudule computes entropy based a nested design pattern. The pattern shown are nested-integrated but
    we dont compute the integration portion of entropy because it's too complicated. For nested design patterns
    there is an inner and an outer pattern. The outer design pattern is the same as the disign pattern in the
    Design Patter view. The inner pattern is a semi-palidrome. Below is and example of a semi-palindrome.

       abcdef int fedcbe

    It has three parts, the left side, the right side and the middle. The middle can be any 3 characters. The
    right side must be the reverse of the left side. The left and right sides must be at lease 3 characters 
    long to classifiy as a semi-palindrome.

    Two semi-palindromes are said to be integrated if their middle parts are identical, for example:

        abababc xyz cbababa
        foo xyz oof
    
    Note that the length of the semi-palindromes don't have to be the same to be integrated


**************************************************************************************************************/

app.controller("nestedDesignPatternCtrl", function ($scope) {

    const textSize = 3800;
    const minSemiPalondromeSize = 12;
    $scope.formattedText = "Coming Soon";
    var organizedIntegrationTable = [];



    var init = function () {
    }

    $scope.makeOrganizedText = function () {
        var text = "";
        var i = 0;
        organizedIntegrationTable = makeOrganizedIntegrationTable();
        while (text.length < textSize) {
            text += makeRandomSizedNestedPattern();
        }
        console.log("Organized text size: " + text.length);
        $scope.info = text;
        $scope.formattedText = formatText($scope.info);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        normalizingFactor = 1 / $scope.entropy;
        $scope.normalizedEntropy = 1;
        $scope.maximumEntropy = 1;
        $scope.minimunEntropySinceMax = 1;
    }

    var makeRandomSizedNestedPattern = function () {
        var nestedPatternSize = 14 + Math.floor(16 * Math.random());

        //Make a semipalendrome of random size that that fits inside the nested pattern
        var innerPatternSize = minSemiPalondromeSize + Math.floor((nestedPatternSize - 2 - minSemiPalondromeSize) * Math.random());
        innerPatternSize = innerPatternSize - innerPatternSize % 2; //Make even number
        var stemSize = (innerPatternSize - 4) / 2;
        var stem = app.makeRandomLowerCaseText(stemSize);
        var reverseStem = stem.split("").reverse().join("");
        var innerPattern = stem + organizedIntegrationTable[Math.floor(10 * Math.random())] + reverseStem;

        //Embed the inner pattern randomly
        var startPosition = Math.floor((nestedPatternSize - innerPatternSize) * Math.random());
        var result = app.makeRandomLowerCaseText(startPosition) + innerPattern + app.makeRandomLowerCaseText(nestedPatternSize - innerPattern.length - startPosition - 2);
        result = app.randomUppercaseLetter() + result + app.randomPunctuation();
        return result;
    }

    var makeOrganizedIntegrationTable = function () {
        var result = [];
        for (var i = 0; i < 10; i++) {
            result[i] = app.makeRandomLowerCaseText(4);
        }
        return result;
    }

    let characterProperties = [{}];

    // Format text by highlighting nested design pattern parts
    formatText = function (text, changeIndex) {
        if (changeIndex === undefined) changeIndex = -1;
        var segment, miss, match;
        var i = 0;
        var j;
        var formattedText = "";
        var bi = 0; //belongsToIndex;

        do {
            segment = app.getPunctuationDelimitedSegment(text, i);
            let segmentParts = app.splitSegment(segment);

            //Format the miss portion of the segment
            if (changeIndex >= i && changeIndex < i + segmentParts.miss.length) {
                //The change occurred inside the miss
                formattedText += segmentParts.miss.substr(0, changeIndex - i);
                formattedText += '<span class="change-text">' + segmentParts.miss.charAt(changeIndex - i) + '</span>';
                formattedText += segmentParts.miss.substr(changeIndex - i + 1);
            } else {
                formattedText += segmentParts.miss;
            }
            i += segmentParts.miss.length;

            //Format the match portion of the segment
            if (changeIndex >= i && changeIndex < i + segmentParts.match.length) {
                //The change occurred inside the match
                formattedText += '<span class="match">' + segmentParts.match.substr(0, changeIndex - i);
                formattedText += '<span class="change-text">' + segmentParts.match.charAt(changeIndex - i) + '</span>';
                formattedText += segmentParts.match.substr(changeIndex - i + 1) + '</span>';
            } else {
                segmentParts = detectInnerPattern(segmentParts);
                if (segmentParts.innerPattern === undefined) {
                    formattedText += '<span class="matchLeft">' + segmentParts.match + '</span>';
                } else {
                    formattedText += '<span class="matchLeft">' + segmentParts.matchLeft + '</span>';
                    formattedText += '<span class="innerPattern">' + segmentParts.innerPattern + '</span>';
                    formattedText += '<span class="matchRight">' + segmentParts.matchRight + '</span>';
                }
            }
            i += segmentParts.match.length;

            //Compute the values of characterProperties[] so that they can be used in the entropy calculation
            characterProperties[bi] = {};
            characterProperties[bi].matchLength = 4;
            for (j = 0; j < segmentParts.miss.length; j++)
                characterProperties[bi++].missLength = -segmentParts.miss.length;
            for (j = 0; j < segmentParts.match.length; j++) {
                characterProperties[bi] = {};
                characterProperties[bi++].matchLength = segmentParts.match.length;
            }

        } while (i < text.length);

        return formattedText;
    }

    detectInnerPattern = function (segment) {
        //The inner pattern has a minimum length of 12 so with end point the match must be a minimum of length to hold a pattern
        if (segment.match < 14)
            return segment;

        for (i = 5; i < segment.match.length - 5; i++) {
            leftIndex = i - 1;
            rightIndex = i + 4;
            stemLength = 0;
            while (segment.match.charAt(leftIndex--) === segment.match.charAt(rightIndex++))
                stemLength++;
            if (stemLength >= 4) {
                segment.matchLeft = segment.match.substr(0, i - stemLength);
                segment.innerPattern = segment.match.substr(segment.matchLeft.length, 2 * stemLength + 4);
                segment.innerPatternLoop = segment.match.substr(i, 4);
                segment.matchRight = segment.match.substr(segment.matchLeft.length + segment.innerPattern.length);
            }
        }
        console.log(segment);
        return segment;
    }

    $scope.makeRandomText = function () {
        text = app.makeRandomText(3800, characterSet);
        $scope.formattedText = formatText(text);
        $scope.entropy = calculateEntropy();
    }

    $scope.scrambleText = function () {
        text = app.scrambleText(text);
        $scope.formattedText = formatText(text);
        $scope.entropy = calculateEntropy();
    }

    $scope.makeChange = function () {
    }

    var makingChanges = false;
    $scope.makeContinuousChanges = function () {
        if (makingChanges === true) {
            makingChanges = false;
            $('#mcc').text('Make Continuous Changes');
            return;
        }
        makingChanges = true;
        $('#mcc').text('STOP making changes');
        makeChangeRecursive();
    }

    var makeChangeRecursive = function () {
        if (makingChanges === false)
            return;
        $scope.makeChange();
        $scope.$apply(); //updates the UI
        setTimeout(makeChangeRecursive, 100);
    }



    var delimiterCount;
    var calculateEntropy = function () {
        var sum = 0, i;
        //To be supplied
        return -sum;
    }

    var entropyTerm = function (i) {
        var p, result, length;
        //To be supplied
        result = p * Math.log(p);
        return result;
    }

    init();
});
