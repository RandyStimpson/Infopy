/*
    This module demonstrates a calculation of entropy as it relates a design pattern. Actual information consists of many design patterns
    but for the sake of calculation we will just pick one for the entropy calculation. These are the properties of the pattern:

        1) It must begin with a capital letter.
        2) It must end with a punctuation mark.
        3) All characters in between must be lower case letters.

    EXAMPLES of strings that match the design pattern:

        Xqzg.
        Doesentropyapplytoinformation:
        Theprobabilityofarandomstringthislongmatchingthedesignpatternisextremelylow!

    For the sake of discussion we will call a string that matches the design patters a Match. A string that does not match the design pattern and
    that does not contain a matching design pattern is a Miss. A string that matches the design pattern except for the punctuation mark is a 
    Subpattern.

    The belongsTo array contains as many values as there are characters of text. The values indicate whether or not the character belongs to a miss
    or a match as well is the size of the miss or match. Positive numbers are for matches and negative numbers are for misses. These numbers are used
    to calculate entropy.

*/
app.controller("designPatternCtrl", function ($scope) {

    var belongsTo = [];
    const textSize = 3800;

    init = function () {
        $scope.makeRandomText();
    }

    $scope.scrambleText = function () {
        $scope.info = app.scrambleText($scope.info);
        $scope.formattedText = formatText($scope.info, -1);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        if ($scope.entropy > $scope.maximumEntropy) {
            $scope.maximumEntropy = $scope.entropy;
            $scope.minimunEntropySinceMax = $scope.entropy;
        }
        if ($scope.entropy < $scope.minimunEntropySinceMax)
            $scope.minimunEntropySinceMax = $scope.entropy;
    }

    $scope.makeOrganizedText = function () {
        var text = "";
        var i = 0;

        while (text.length < textSize) {
            text += makeRandomSizedMatch();
        }
        console.log("Organized text size: " + text.length);
        $scope.info = text;
        $scope.formattedText = formatText($scope.info);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        $scope.startingEntropy = $scope.entropy;
        $scope.maximumEntropy = $scope.entropy;
        $scope.minimunEntropySinceMax = $scope.entropy;
    }

    $scope.makeChange = function () {
        var r = Math.floor($scope.info.length * Math.random());
        var randomChar = app.makeRandomText(1, characterSet1);
        $scope.info = $scope.info.substr(0, r) + randomChar + $scope.info.substr(r + 1);
        $scope.formattedText = formatText($scope.info, r);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        if ($scope.entropy > $scope.maximumEntropy) {
            $scope.maximumEntropy = $scope.entropy;
            $scope.minimunEntropySinceMax = $scope.entropy;
        }
        if ($scope.entropy < $scope.minimunEntropySinceMax)
            $scope.minimunEntropySinceMax = $scope.entropy;
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

    $scope.makeRandomText = function () {
        $scope.info = app.makeRandomText(textSize, characterSet1);
        $scope.formattedText = formatText($scope.info);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        $scope.startingEntropy = $scope.entropy;
        $scope.maximumEntropy = $scope.entropy;
        $scope.minimunEntropySinceMax = $scope.entropy;
    }


    // Format text by highlighting the matches and the changed text.
    formatText = function (text, changeIndex) {
        if (changeIndex === undefined) changeIndex = -1;
        var segment, miss, match;
        var i = 0;
        var j;
        var formattedText = "";
        belongsTo = [];
        var bi = 0; //belongsToIndex;
        totalCharactersInMissSegments = 0;
        totalCharactersInMatchSegments = 0;

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
            totalCharactersInMissSegments += segmentParts.miss.length;

            //Format the match portion of the segment
            if (changeIndex >= i && changeIndex < i + segmentParts.match.length) {
                //The change occurred inside the match
                formattedText += '<span class="match">' + segmentParts.match.substr(0, changeIndex - i);
                formattedText += '<span class="change-text">' + segmentParts.match.charAt(changeIndex - i) + '</span>';
                formattedText += segmentParts.match.substr(changeIndex - i + 1) + '</span>';
            } else {
                formattedText += '<span class="match">' + segmentParts.match + '</span>';
            }
            i += segmentParts.match.length;
            totalCharactersInMatchSegments += segmentParts.match.length;

            //Compute the values of belongsTo[] so that they can be used in the entropy calculation
            for (j = 0; j < segmentParts.miss.length; j++)
                belongsTo[bi++] = -segmentParts.miss.length;
            for (j = 0; j < segmentParts.match.length; j++)
                belongsTo[bi++] = segmentParts.match.length;

        } while (i < text.length);

        pOfBeingInMissSegment = totalCharactersInMissSegments / text.length;
        pOfBeingInMatchSegment = totalCharactersInMatchSegments / text.length;

        return formattedText;
    }


    computeEntropyBasedOnDesignPattern = function () {
        var i;
        var p;
        sum = 0;

        // Each character contributes to entropy based on the probability of the segment it belongs to.
        for (i = 0; i <= $scope.info.length; i++) {
           if (belongsTo[i] < 0) p = pOfMiss(-belongsTo[i]); 
           if (belongsTo[i] > 0) p = pOfMatch(belongsTo[i]);
           sum += p * Math.log(p);
        }
        return -sum;
    }

    makeRandomMatch = function (size) {
        return app.makeRandomText(1, "ABCDEFGHIJKLMNOPQRSTUVWXYZ") + app.makeRandomText(size - 2, "abcdefghijklmnopqrstuvwxyz") + app.makeRandomText(1, punctuationSet);
    }

    makeRandomSizedMatch = function () {
        //Vary size randomly between 14 and 30
        var randomSize = Math.floor(14 + 17 * Math.random());
        return makeRandomMatch(randomSize);
    }

    init();

});