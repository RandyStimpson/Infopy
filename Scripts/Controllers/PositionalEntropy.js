app.controller("positionalEntropyCtrl", function ($scope) {

    //Choosing a character set with 64 characters will give us a maximum entropy of 6 bits per character
    var CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz -;:?,.!'123";

    var startingText = readFileToString("TEXTBOX.md");
    console.log(startingText.length);
    

    function readFileToString(fileName) {
        let fileContent = null;
        $.ajax({
          url: fileName,
          async: false,
          success: function(data) {
            fileContent = data;
          },
          error: function(xhr, status, error) {
            console.error(`Failed to read file: ${fileName} (status ${xhr.status})`);
          }
        });
        return fileContent;
    }

    // TODO: In order to be able to reach a maximum entropy of 6, the number of text characters needs to be a multiple
    // of 64, the number of characters in the character set.

    // TODO: Graph the counts of each of the characters in the character set.

    // TODO: Predict how long it would take for entropy go below a certain threshold.

    // TODO: Add a random button.

    // TODO: Predict the percentage of character configration with an entropy less that 5

    // Load
    $scope.initialize = function () {

        $scope.info = startingText;
        $scope.info1 = $scope.info;
        $scope.info2 = "";
        $scope.changeText = "";
        $scope.changeCount = 0;
        $scope.entropy = $scope.calculateEntropy(CHARACTER_SET, startingText);
        $scope.startingEntropy = $scope.entropy;
        $scope.increasesDuringTheFirst100Changes = 0;
        $scope.decreasesDuringTheFirst100Changes = 0;
        $scope.unchangedDuringTheFirst100Changes = 0;
        $scope.increasesDuringTheLast100Changes = 0;
        $scope.decreasesDuringTheLast100Changes = 0;
        $scope.unchangedDuringTheLast100Changes = 0;
        $scope.changeType = [];
        $scope.expectedEntropyOfRandomText = $scope.estimateMeanPositionalEntropyOfRandomCharacterSet();
    }

    $scope.makeChange = function () {
        //choose random position in info to change
        $scope.position = Math.floor(Math.random() * $scope.info.length);
        $scope.characterToReplace = $scope.info.substring($scope.position, $scope.position + 1);

        //pick a random character from the alphabet to replace the character at that position
        do {
            $scope.i = Math.floor(Math.random() * CHARACTER_SET.length);
            $scope.changeText = CHARACTER_SET.substring($scope.i, $scope.i + 1);
        } while ($scope.changeText == $scope.characterToReplace);

        $scope.info1 = $scope.info.substring(0, $scope.position);
        $scope.info2 = $scope.info.substring($scope.position + 1, $scope.info.length)
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;

        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy(CHARACTER_SET, $scope.info);
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
        if ($scope.changeInEntropy == 0)
            var same = 1;
        $scope.countIncreasesAndDecreasesInEntropy();
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


    $scope.resetText = function () {
        $scope.initialize();
        $('.information-box').removeClass('break-words');
    }

    $scope.calculateEntropy = function (theCharacterSet, theText) {
        var i;
        var sum = 0;
        for (i = 0; i < theCharacterSet.length; i++)
            sum += $scope.entropyTerm(theCharacterSet.substr(i, 1), theText);
        return -sum;
    }

    $scope.entropyTerm = function (ch, theText) {
        var i;
        var count = 0;
        for (i = 0; i < theText.length; i++) {
            if (ch == theText.substr(i, 1))
                count++;
        }
        probability = count / theText.length;
        if (probability == 0) {
            return 0;
        }
        return probability * Math.log(probability) / Math.LN2;
    }

    $scope.countIncreasesAndDecreasesInEntropy = function () {
        $scope.changeCount++;
        if ($scope.changeCount <= 100) {
            if ($scope.changeInEntropy > 0)
                $scope.increasesDuringTheFirst100Changes++;
            else if ($scope.changeInEntropy < 0)
                $scope.decreasesDuringTheFirst100Changes++;
            else
                $scope.unchangedDuringTheFirst100Changes++;
        }

        if ($scope.changeCount > 100) {
            var oldestChangeType = $scope.changeType[($scope.changeCount - 1) % 100];
        }
        if ($scope.changeInEntropy > 0)
            $scope.changeType[($scope.changeCount - 1) % 100] = 1;
        else if ($scope.changeInEntropy < 0)
            $scope.changeType[($scope.changeCount - 1) % 100] = -1;
        else
            $scope.changeType[($scope.changeCount - 1) % 100] = 0;

        if ($scope.changeCount <= 100) {
            $scope.increasesDuringTheLast100Changes = $scope.increasesDuringTheFirst100Changes;
            $scope.decreasesDuringTheLast100Changes = $scope.decreasesDuringTheFirst100Changes;
            $scope.unchangedDuringTheLast100Changes = $scope.unchangedDuringTheFirst100Changes;
        } else {
            var lastChangeType = $scope.changeType[($scope.changeCount - 1) % 100];
            if (oldestChangeType != lastChangeType) {
                if (oldestChangeType == 1 && lastChangeType == 0) {
                    $scope.increasesDuringTheLast100Changes--;
                }
                if (oldestChangeType == 1 && lastChangeType == -1) {
                    $scope.increasesDuringTheLast100Changes--;
                    $scope.decreasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == 0 && lastChangeType == 1) {
                    $scope.increasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == 0 && lastChangeType == -1) {
                    $scope.decreasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == -1 && lastChangeType == 1) {
                    $scope.increasesDuringTheLast100Changes++;
                    $scope.decreasesDuringTheLast100Changes--;
                }
                if (oldestChangeType == -1 && lastChangeType == 0) {
                    $scope.decreasesDuringTheLast100Changes--;
                }
            }
            $scope.unchangedDuringTheLast100Changes = 100 - $scope.increasesDuringTheLast100Changes - $scope.decreasesDuringTheLast100Changes;
        }
    }

    $scope.scrambleText = function () {
        $scope.info1 = app.scrambleText($scope.info);
        $scope.info2 = "";
        $scope.changeText = "";
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;
        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy(CHARACTER_SET, $scope.info);
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
    }

    $scope.orderText = function () {
        $scope.info1 = app.orderText($scope.info);
        $scope.changeText = "";
        $scope.info2 = "";
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;
        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy(CHARACTER_SET, $scope.info);
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
        $('.information-box').addClass('break-words');
    }

    $scope.estimateMeanPositionalEntropyOfRandomCharacterSet = function () {
        var sampleSize = 100;
        var sumOfEntropys = 0;

        for (var i = 0; i < sampleSize; i++) {
            var randomText = app.makeRandomText(startingText.length, CHARACTER_SET);
            sumOfEntropys += $scope.calculateEntropy(CHARACTER_SET, randomText);
        }
        return sumOfEntropys / sampleSize;
    }

    $scope.initialize();
});