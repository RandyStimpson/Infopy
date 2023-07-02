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
    let IntegratedSegmentChoices = [];
    let TextMetadata;
    let Position;
    let ChangeIndex;
    let Text = "";
    $scope.nestedPatternDescription = app.readFileToString('NestedPattern.md');

    var init = function () {
        $scope.makeRandomText();
    }

    $scope.makeOrganizedText = function () {
        let text = "";
        let i = 0;
        IntegratedSegmentChoices = makeOrganizedIntegrationTable();
        while (text.length < textSize) {
            text += makeNestedIntegratedPattern();
        }
        textMetadata = makeTextMetaData(text);
        $scope.formattedText = formatText(textMetadata, -1);
        normalizingFactor = 1 / $scope.entropy;
        $scope.normalizedEntropy = 1;
        $scope.maximumEntropy = 1;
        $scope.minimunEntropySinceMax = 1;
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        $scope.entropy = computeEntropyBasedOnNestedDesignPattern();
        $scope.startingEntropy = $scope.entropy;
        Text = text;
        Position = 0;
        ChangeIndex = -1;
    }

    $scope.insertNestedPattern = function () {
        let nestedPattern = makeNestedPattern();
        let startPosition = Math.floor(Math.random() * (Text.length - nestedPattern.length - 0.01));
        Text = Text.slice(0, startPosition) + nestedPattern + Text.slice(startPosition + nestedPattern.length);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata, -1);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        $scope.entropy = computeEntropyBasedOnNestedDesignPattern();
        Position = 0;
        ChangeIndex = -1;
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
        for (let i = 0; i < textMetadata.length; i++) {
            if (textMetadata[i].innerPattern !== undefined)
                count++;
        }
        return count;
    }

    let makeNestedIntegratedPattern = function () {
        let nestedPatternSize = 14 + Math.floor(16 * Math.random());

        //Make a semipalendrome of random size that that fits inside the nested pattern
        let innerPatternSize = minSemiPalondromeSize + Math.floor((nestedPatternSize - 2 - minSemiPalondromeSize) * Math.random());
        innerPatternSize = innerPatternSize - innerPatternSize % 2; //Make even number
        let stemSize = (innerPatternSize - 4) / 2;
        let stem = getIntegratedSegmentChoice() + app.makeRandomLowerCaseText(stemSize-4);
        let reverseStem = stem.split("").reverse().join("");
        let innerPattern = stem + getIntegratedSegmentChoice() + reverseStem;

        //Embed the inner pattern randomly
        let startPosition = Math.floor((nestedPatternSize - innerPatternSize) * Math.random());
        let result = app.makeRandomLowerCaseText(startPosition) + innerPattern + app.makeRandomLowerCaseText(nestedPatternSize - innerPattern.length - startPosition - 2);
        result = app.randomUppercaseLetter() + result + app.randomPunctuation();
        return result;
    }

    makeNestedPattern = function () {
        let nestedPatternSize = 14 + Math.floor(16 * Math.random());

        //Make a semipalendrome of random size that that fits inside the nested pattern
        let innerPatternSize = minSemiPalondromeSize + Math.floor((nestedPatternSize - 2 - minSemiPalondromeSize) * Math.random());
        innerPatternSize = innerPatternSize - innerPatternSize % 2; //Make even number
        let stemSize = (innerPatternSize - 4) / 2;
        let stem = app.makeRandomLowerCaseText(stemSize);
        let reverseStem = stem.split("").reverse().join("");
        let innerPattern = stem + app.makeRandomLowerCaseText(4) + reverseStem;

        //Embed the inner pattern randomly
        let startPosition = Math.floor((nestedPatternSize - innerPatternSize) * Math.random());
        let result = app.makeRandomLowerCaseText(startPosition) + innerPattern + app.makeRandomLowerCaseText(nestedPatternSize - innerPattern.length - startPosition - 2);
        result = app.randomUppercaseLetter() + result + app.randomPunctuation();
        console.log("Nested Pattern", result);
        return result;
    }

    var getIntegratedSegmentChoice = function () {
        return IntegratedSegmentChoices[Math.floor(IntegratedSegmentChoices.length * Math.random())];
    }

    var makeOrganizedIntegrationTable = function () {
        let result = [];
        for (var i = 0; i < 100; i++) {
            result[i] = app.makeRandomLowerCaseText(4);
        }
        return result;
    }


    // Build metedata about text for formatting and measuring integration
    makeTextMetaData = function (text) {
        let textMetaData = [];
        let segment;
        let i = 0;
        segmentTable = [];
        do {
            segment = app.getPunctuationDelimitedSegment(text, i);
            segmentParts = app.splitSegment(segment);
            segmentParts = detectInnerPattern(segmentParts);
            if (segmentParts.innerPattern !== undefined) {
                insertSegment(segmentParts.innerPatternLeft);
                insertSegment(segmentParts.innerPatternRight);
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
        //Delete after testing
        TextMetadata = textMetadata;

        ChangeIndex = changeIndex;
        Position = 0;

        let result = "";
        for (var i = 0; i < textMetadata.length; i++) {
            segmentParts = textMetadata[i];
            result += formatSegment(segmentParts.miss, "");
            if (segmentParts.match.length > 0) {
                if (segmentParts.innerPattern === undefined) {
                    result += formatSegment(segmentParts.match, "match");
                } else {
                    result += formatSegment(segmentParts.matchLeft, "match-left");
                    result += formatSegment(segmentParts.innerPatternLeft, "inner-pattern");
                    if (segmentParts.integrationLevel == 0) {
                        result += formatSegment(segmentParts.innerPatternLoop, "loop");
                    } else {
                        result += formatSegment(segmentParts.innerPatternLoop, "integrated-loop");
                    }
                    result += formatSegment(segmentParts.innerPatternRight, "inner-pattern");
                    result += formatSegment(segmentParts.matchRight, "match-right");
                }
            }
        }
        return result;
    }

    computeEntropyBasedOnNestedDesignPattern = function () {
        // The entropy calculation will not take into account integration so the calculated value
        // will not be a low as it actually is when there is integration.

        let p;
        let sum = 0;

        // Each character contributes to entropy based on the probability of the segment it belongs to.
        for (let i = 0; i < TextMetadata.length; i++) {
            let segmentParts = TextMetadata[i];
            if (segmentParts.miss.length > 0) {
                p = pOfMiss(segmentParts.miss.length);
                entropyTerm = p * Math.log(p);

                // Each character contributes and entropy term.
                sum += segmentParts.miss.length * entropyTerm;
            }
            if (segmentParts.match.length > 0) {
                p = pOfMatch(segmentParts.match.length);
                if (segmentParts.innerPattern !== undefined) {
                    //Determine to number of location an inner pattern of this size can occur in the outer design pattern.
                    let locations = segmentParts.match.length - segmentParts.innerPattern.length - 1;
                    p = p * pOfInnerPattern(segmentParts.innerPattern.length) * locations;
                }
                // Each character contributes and entropy term.
                entropyTerm = p * Math.log(p);
                sum += segmentParts.match.length * entropyTerm;                
            }
        }
        return -sum;
    }

    //Use lookup table to reduce Math.pow calls and improve efficiency
    pOfInnerPatternLookupTable = [];
    pOfInnerPattern = function (length) {
        if (pOfInnerPatternLookupTable[length] === undefined)
            pOfInnerPatternLookupTable[length] = Math.pow(26,-(length-4)/2);
        return pOfInnerPatternLookupTable[length];
    }


    $scope.formatNext = function () {
        //This function is only used to test formating
        ChangeIndex++;
        $scope.formattedText = formatText(TextMetadata,ChangeIndex);
    }

    $scope.evolve = function () {
        $scope.formattedText = app.readFileToString("NestedPatternChallenge.md");
    }

    formatSegment = function (text, cssClass) {
        let result;
        let changeIndex = ChangeIndex-Position;
        Position += text.length;
        if (changeIndex == NaN || changeIndex < 0 || changeIndex >= text.length) {
            if (cssClass === "")
                result = text;
            else
                result = '<span class="' + cssClass + '">' + text + '</span>';
        } else {
            if (cssClass === "") {
                result = text.substring(0, changeIndex);
                result += '<span class="change-text">' + text.charAt(changeIndex) + '</span>';
                result += text.substring(changeIndex + 1);
            }
            else {
                result = '<span class="' + cssClass + '">' + text.substring(0, changeIndex) + '</span>';
                result += '<span class="change-text">' + text.charAt(changeIndex) + '</span>';
                result += '<span class="' + cssClass + '">' + text.substring(changeIndex + 1) + '</span>';
            }
        }
        return result;
    }

    var segmentTable = [];
    insertSegment = function (segment) {
       segmentTable[segmentTable.length] = segment;
    }

    getIntegrationLevel = function (loop) {
        let result = 0;
        for (i = 0; i < segmentTable.length; i++) {
            if (segmentTable[i].indexOf(loop) >= 0)
                result ++;
        }
        return result;
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
        IntegratedSegmentChoices = makeOrganizedIntegrationTable();
        Text = app.makeRandomText(3800, characterSet1);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata,-1);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        $scope.entropy = computeEntropyBasedOnNestedDesignPattern();
        $scope.startingEntropy = $scope.entropy;
        ChangeIndex = -1; 
        Position = 0;
    }

    $scope.scrambleText = function () {
        Text = app.scrambleText(Text);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata,-1);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        $scope.entropy = computeEntropyBasedOnNestedDesignPattern();
        $scope.startingEntropy = $scope.entropy;
    }

    $scope.makeChange = function () {
        let changeLocation = Math.floor(Math.random() * (Text.length - .01));
        Text = Text.slice(0, changeLocation) + app.RandomChar() + Text.slice(changeLocation + 1);
        let textMetadata = makeTextMetaData(Text);
        $scope.formattedText = formatText(textMetadata, changeLocation);
        $scope.innerPatternCount = calculateInnerPatternCount(textMetadata);
        $scope.integrationScore = calculateIntegrationScore(textMetadata);
        $scope.entropy = computeEntropyBasedOnNestedDesignPattern();
    }

    let makingChanges = false;
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

    let makeChangeRecursive = function () {
        if (makingChanges === false)
            return;
        $scope.makeChange();
        $scope.$apply(); //updates the UI
        setTimeout(makeChangeRecursive, 100);
    }

    init();
});
