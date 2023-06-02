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
    var integratedLoopChoices = [];
    var textMetadata;
    let Text = "";
    $scope.nestedPatternDescription = app.readFileToString('NestedPattern.md');

    var init = function () {
        $scope.makeRandomText();
    }

    $scope.makeOrganizedText = function () {
        let text = "";
        let i = 0;
        integratedLoopChoices = makeOrganizedIntegrationTable();
        while (text.length < textSize) {
            text += makeRandomSizedNestedPattern();
        }
        textMetadata = makeTextMetaData(text);
        $scope.formattedText = formatText(textMetadata);
        normalizingFactor = 1 / $scope.entropy;
        $scope.normalizedEntropy = 1;
        $scope.maximumEntropy = 1;
        $scope.minimunEntropySinceMax = 1;
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        Text = text;
    }

    $scope.insertNestedPattern= function () {
        let nestedPattern = makeRandomSizedNestedPattern();
        let startPosition = Math.floor(Math.random() * (Text.length-nestedPattern.length - 0.01));
        Text = Text.slice(0, startPosition) + nestedPattern + Text.slice(startPosition + nestedPattern.length);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
    }

    var calculateIntegrationScore = function (textMetadata) {
        let integrationScore = 0;
        for (let i = 0; i < textMetadata.length; i++) {
            if (textMetadata[i].integrationLevel !== undefined)
                integrationScore += textMetadata[i].integrationLevel;
        }
        return integrationScore;
    }

    calculateInnerPatternCount = function (textMetadata) {
        let count = 0;
        for (let i = 0; i < textMetadata.length; i++ ) {
            if (textMetadata[i].innerPattern !== undefined)
                count++;
        }
        return count;
    }

    var makeRandomSizedNestedPattern = function () {
        var nestedPatternSize = 14 + Math.floor(16 * Math.random());

        //Make a semipalendrome of random size that that fits inside the nested pattern
        var innerPatternSize = minSemiPalondromeSize + Math.floor((nestedPatternSize - 2 - minSemiPalondromeSize) * Math.random());
        innerPatternSize = innerPatternSize - innerPatternSize % 2; //Make even number
        var stemSize = (innerPatternSize - 4) / 2;
        var stem = app.makeRandomLowerCaseText(stemSize);
        var reverseStem = stem.split("").reverse().join("");
        console.log("integratedLoopChoices", integratedLoopChoices);
        if (integratedLoopChoices.length === 0) {
            var innerPattern = stem +  app.makeRandomLowerCaseText(4) + reverseStem;
            console.log("innerPattern", innerPattern);
        } else {
            innerPattern = stem + integratedLoopChoices[Math.floor(integratedLoopChoices.length * Math.random())] + reverseStem;
            console.log("innerPattern", innerPattern);
        }

        //Embed the inner pattern randomly
        var startPosition = Math.floor((nestedPatternSize - innerPatternSize) * Math.random());
        var result = app.makeRandomLowerCaseText(startPosition) + innerPattern + app.makeRandomLowerCaseText(nestedPatternSize - innerPattern.length - startPosition - 2);
        result = app.randomUppercaseLetter() + result + app.randomPunctuation();
        return result;
    }

    var makeOrganizedIntegrationTable = function () {
        var result = [];
        for (var i = 0; i < 100; i++) {
            result[i] = app.makeRandomLowerCaseText(4);
        }
        return result;
    }


    // Format text by highlighting nested design pattern parts
    makeTextMetaData = function (text) {
        let textMetaData = [];
        let segment;
        let i = 0;
        loopTable = [];
        do {
            segment = app.getPunctuationDelimitedSegment(text, i);
            segmentParts = app.splitSegment(segment);
            segmentParts = detectInnerPattern(segmentParts);
            if (segmentParts.innerPattern !== undefined) {
                insertLoop(segmentParts.innerPatternLoop);
            }
            textMetaData.push(segmentParts)
            i += segment.length;
        } while (i < text.length);

        textMetaData.forEach(item => {
            if (item.innerPatternLoop !== undefined) {
                item.integrationLevel = getIntegrationLevel(item.innerPatternLoop);
            }
        });
        return textMetaData;
    }

    formatText = function (textMetadata, changeIndex) {
        result = "";
        for (var i = 0; i < textMetadata.length; i++) {
            segmentParts = textMetadata[i];
            result += segmentParts.miss;

            if (segmentParts.match.length > 0) {
                if (segmentParts.innerPattern === undefined) {
                    result += '<span class="match">' + segmentParts.match + '</span>';
                } else {
                    result += '<span class="matchLeft">' + segmentParts.matchLeft + '</span>';
                    result += '<span class="innerPattern">' + segmentParts.innerPatternLeft + '</span>';
                    console.log("integrationLevel", segmentParts.integrationLevel);
                    if (segmentParts.integrationLevel == 0) {
                        result += '<span class="loop">' + segmentParts.innerPatternLoop + '</span>';
                    } else {
                        result += '<span class="integratedLoop">' + segmentParts.innerPatternLoop + '</span>';
                    }
                    result += '<span class="innerPattern">' + segmentParts.innerPatternRight + '</span>';
                    result += '<span>';
                    result += '<span class="matchRight">' + segmentParts.matchRight + '</span>';
                }
            }
        }
        return result;
    }


    var loopTable = [];
    insertLoop = function (loop) {
        loopIsInTable = false;
        loopTable.forEach(element => {
            if (element.loop === loop) {
                element.count++;
                loopIsInTable = true;
                return true;
            }
        });
        if (!loopIsInTable) {
            loopTable[loopTable.length] = {
                loop: loop,
                count: 1
            };
            return false;
        }
    }

    getIntegrationLevel = function (loop) {
        for (i = 0; i < loopTable.length; i++) {
            if (loopTable[i].loop == loop) {
                return loopTable[i].count - 1;
            }
        }
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
                segment.innerPatternLeft = segment.match.substr(segment.matchLeft.length, stemLength);
                segment.innerPattern = segment.match.substr(segment.matchLeft.length, 2 * stemLength + 4);
                segment.innerPatternLoop = segment.match.substr(i, 4);
                segment.innerPatternRight = segment.match.substr(i + 4, stemLength);
                segment.matchRight = segment.match.substr(segment.matchLeft.length + segment.innerPattern.length);
            }
        }
        return segment;
    }

    $scope.makeRandomText = function () {
        integratedLoopChoices = [];
        Text = app.makeRandomText(3800, characterSet1);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
    }

    $scope.scrambleText = function () {
        Text = app.scrambleText(Text);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        //$scope.entropy = calculateEntropy();
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
