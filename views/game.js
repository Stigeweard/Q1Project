$(document).ready(function() {

    // IMPORTANT NOTES:
    // * for some reason adblock plugin will cause bugs
    // * first tier is the top tier (3 total cards)

    let deckID = null;
    let currentBoard = null;
    let deck = {};
    let currentScore = 0;
    let scoreStreak = 0;
    let pyramidOneDone = false;
    let pyramidTwoDone = false;
    let pyramidThreeDone = false;
    let boardCopy = null;
    let reseted = false;
    const logicArr = [
        [1, 11, 20],
        [2, 3],
        [4, 5],
        [5, 6],
        [7, 8],
        [8, 9],
        [9, 10], null, null, null, null, [12, 13],
        [14, 15],
        [15, 16],
        [10, 17],
        [17, 18],
        [18, 19], null, null, null, [21, 22],
        [23, 24],
        [24, 25],
        [19, 26],
        [26, 27],
        [27, 28], null, null, null
    ];
    let firstTier = [1, 11, 20];
    let secondTier = [2, 3, 12, 13, 21, 22];
    let thirdTier = [4, 5, 6, 14, 15, 16, 23, 24, 25];
    let tierFour = [7, 8, 9, 10, 17, 18, 19, 26, 27, 28];
    let nodeObj = {};

    $('#newHand').click(newHand);
    $('.cardBox').on('click', cardClick);
    $('.cardBoxpile').on('click', pileClick);
    $('#reset').click(resetHand);

    function GameBoard(pile, play) {
        this.root = fetchNodes(logicArr[0]);
        this.pile = pile || [];
        this.play = play || [];
    };

    GameBoard.prototype.refresh = function(targetCard) {
        for (var key in nodeObj) {
            if (nodeObj[key].data.code === targetCard) {
                nodeObj[key].data.addedToPlayPile = true;
                this.play.push(nodeObj[key].data);
            }
        }
    };

    function CardNode(data, position, children) {
        this.data = data || null;
        this.position = position;
        this.parent = null;
        this.children = children;
    };

    CardNode.prototype.left = function() {
        if (this.children.length > 1) {
            return this.children[0];
        } else {
            console.log('no chillrens');
        }
    }

    CardNode.prototype.right = function() {
        if (this.children.length > 1) {
            return this.children[1];
        } else {
            console.log('no chillrens');
        }
    }

    function updateHiScores(hiScoreData) {
        let places = ['first', 'second', 'third'];
        for (var i = 0; i < hiScoreData.length; i++) {
            let place = places[i]
            console.log(place, hiScoreData[i].name);
            $(`#${place}Place`).text(hiScoreData[i].name);
            $(`#${place}PlaceScore`).text(hiScoreData[i].score);
        }
    }

    function hiScoreAJAX() {
        console.log('hiscore ajax');
        $.ajax({
            url: '/scores',
            method: 'GET',
            success: function(data) {
                updateHiScores(data);
            },
            error: (err)=>{
                console.log('scores get failed:', err);
            }
        })
    }

    function fetchNodes(arr) {
        let nodeList = [];
        if (arr !== null) {
            arr.forEach(elem => {
                if (!nodeObj[elem]) {
                    let newNode = new CardNode(null, elem, fetchNodes(logicArr[elem]));
                    nodeObj[elem] = newNode;
                    nodeList.push(newNode);
                } else {
                    nodeList.push(nodeObj[elem]);
                }
            })
        }
        return nodeList;
    };

    function resetScore() {
        currentScore = 0;
        refreshScore();
    }

    function calculateAddScore() {
        scoreStreak++;
        currentScore += scoreStreak;
        victoryCheck();
        refreshScore();
    }
    function submitScore() {
        $.post('/scores', {currentScore})
    }

    function victoryCheck() {
        if (nodeObj[1].data.addedToPlayPile && !pyramidOneDone) {
            console.log('done with one');
            pyramidOneDone = true;
            currentScore += 15;
        }
        if (nodeObj[11].data.addedToPlayPile && !pyramidTwoDone) {
            console.log('done with two');
            pyramidTwoDone = true;
            currentScore += 15;
        }
        if (nodeObj[20].data.addedToPlayPile && !pyramidThreeDone) {
            console.log('done with three');
            pyramidThreeDone = true;
            currentScore += 15;
        }
        if (pyramidOneDone && pyramidTwoDone && pyramidThreeDone) {
            currentScore += 15;
            console.log('done with all, submitting score: ', currentScore);
            submitScore();
        }
    }

    function calculatePileScore() {
        scoreStreak = 0;
        currentScore -= 5;
        refreshScore();
    }

    function refreshScore() {
        $('#scoreSpan').text(currentScore);
        $('#scoreStreakSpan').text(scoreStreak);

    }

    function pileClick(e) {
        let topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
        if (deck[topPileCard].inPlay) {
            calculatePileScore();
            renderCardMove(topPileCard);
            currentBoard.play.push(currentBoard.pile.pop());
            // assign the new topPileCard
            topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
            deck[topPileCard].inPlay = true;
        }
    }

    function cardClick(e) {
        let targetCard = e.target.id;
        if (deck[targetCard].inPlay) {
            // targetCard at 0 because suit doesnt matter in this game ex: 6D = 6 of diamonds
            if (validMove(targetCard[0])) {
                // replace image on play pile
                renderCardMove(targetCard);
                currentBoard.refresh(targetCard)
                flipCheck();
                calculateAddScore(targetCard);
            }
        } else {
            console.log('card is not in play');
        }
    }

    function turnCardOver(nodeData) {
        nodeData.inPlay = true;
        nodeData.image = nodeData.images.png;
        $(`#${nodeData.code}`).attr('src', `${nodeData.image}`);
    }

    function renderCardMove(targetCard) {
        $(`#${targetCard}`).addClass('invis');
        $(`.cardBoxplay img`).attr('src', `${deck[targetCard].images.png}`);
    }

    function flipCheck() {
        for (var node in nodeObj) {
            if (nodeObj[node].left() !== undefined && nodeObj[node].right() !== undefined) {
                if (nodeObj[node].left().data.addedToPlayPile && nodeObj[node].right().data.addedToPlayPile) {
                    turnCardOver(nodeObj[node].data);
                }
            }
        };
    }

    function validMove(target) {
        let inPlay = currentBoard.play[currentBoard.play.length - 1].code[0];
        inPlay.toString();
        target.toString();
        inPlay = inPlay.replace('J', '11');
        inPlay = inPlay.replace('Q', '12');
        inPlay = inPlay.replace('K', '13');
        inPlay = inPlay.replace('A', '1');
        inPlay = inPlay.replace('0', '10');
        target = target.replace('J', '11');
        target = target.replace('Q', '12');
        target = target.replace('K', '13');
        target = target.replace('A', '1');
        target = target.replace('0', '10');
        inPlay = parseInt(inPlay);
        target = parseInt(target);
        if (target === inPlay + 1 || target === inPlay - 1 || (target === 1 && inPlay === 13) || (target === 13 && inPlay === 1)) {
            return true;
        } else {
            console.log('invalid move for inplay card: ', currentBoard.play[currentBoard.play.length - 1].code[0]);
            return false;
        }
    }

    function resetHand() {
        // currently any flipped cards will incorrectly stay flipped
        reseted = true;
        scoreStreak = 0;
        clearStage();
        currentBoard = jQuery.extend(true, {}, boardCopy);
        uncover(currentBoard);
        resetScore();
    }

    function newHand() {
        reseted = false;
        scoreStreak = 0;
        pyramidOneDone = false;
        pyramidTwoDone = false;
        pyramidThreeDone = false;
        firstTier = [1, 11, 20];
        secondTier = [2, 3, 12, 13, 21, 22];
        thirdTier = [4, 5, 6, 14, 15, 16, 23, 24, 25];
        hiScoreAJAX()
        clearStage();
        resetScore();
        if (deckID !== null) {
            shuffle();
        } else {
            newDeck();
        }
    }

    function clearStage() {
        console.log('hallo');
        $('.added').remove();
        $('.cardDiv').remove();
    }

    function uncover(board) {
        popCards(board.pile, 'pile');
        popCards(board.play, 'play');
        for (var i = 0; i < tierFour.length; i++) {
            let tierFourCard = nodeObj[tierFour[i]].data;
            if (!reseted) {
                tierFourCard.flip();
            }
            let $card = $('<img></img>');
            let $cardDiv = $('<div></div>');
            $cardDiv.addClass('cardDiv');
            $card.addClass('card added')
                .attr('id', tierFourCard.code)
                .attr('src', tierFourCard['image'])
                .attr('alt', `fourthTier Front of playing card`);
            $cardDiv.append($card);
            $(`.fourthTier .cardBox`).append($cardDiv);
        }
        if (!reseted) {
            popNodeArray(firstTier);
            popNodeArray(secondTier);
            popNodeArray(thirdTier);
        }
        popPyramids(firstTier, 'firstTier');
        popPyramids(secondTier, 'secondTier');
        popPyramids(thirdTier, 'thirdTier');
    }

    function popNodeArray(tier) {
        for (var i = 0; i < tier.length; i++) {
            tier[i] = nodeObj[tier[i]];
        }
    }

    function popPyramids(cardArr, tier) {
        let cardsPerPyramid = cardArr.length / 3;
        let image = null;
        for (var i = 0; i < cardsPerPyramid; i++) {
            let $card = $('<img></img>');
            let $cardDiv = $('<div></div>');
            $cardDiv.addClass('cardDiv');
            $card.addClass('card added')
                .attr('id', cardArr[i].data.code)
                .attr('src', cardArr[i].data['image'])
                .attr('alt', `${tier} Back of playing card`);
            $cardDiv.append($card);
            $(`.leftPyramid .${tier} .cardBox`).append($cardDiv);
        }
        for (var i = cardsPerPyramid; i < cardsPerPyramid * 2; i++) {
            let $card = $('<img></img>');
            let $cardDiv = $('<div></div>');
            $cardDiv.addClass('cardDiv');
            $card.addClass('card added')
                .attr('id', cardArr[i].data.code)
                .attr('src', cardArr[i].data['image'])
                .attr('alt', `${tier} Back of playing card`);
            $cardDiv.append($card);
            $(`.midPyramid .${tier} .cardBox`).append($cardDiv);
        }
        for (var i = cardsPerPyramid * 2; i < cardArr.length; i++) {
            let $card = $('<img></img>');
            let $cardDiv = $('<div></div>');
            $cardDiv.addClass('cardDiv');
            $card.addClass('card added')
                .attr('id', cardArr[i].data.code)
                .attr('src', cardArr[i].data['image'])
                .attr('alt', `${tier} Back of playing card`);
            $cardDiv.append($card);
            $(`.rightPyramid .${tier} .cardBox`).append($cardDiv);
        }
    }

    // populate HTML with card image and code as id with tier location as first word of alt attribute
    function popCards(cardArr, location) {
        if (location === 'pile') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${location} Back of playing card`);
                if (i > 0) {
                    $cardDiv.addClass('pile');
                }
                $cardDiv.append($card);
                $(`.cardBox${location}`).append($cardDiv);
            }
        } else if (location === 'play') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${location} Back of playing card`);
                $cardDiv.append($card);
                $(`.cardBox${location}`).append($cardDiv);
            }
        }
    };

    // AJAX functions:
    // shuffles current deck instead of calling API for a new one
    function shuffle() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`,
            method: 'GET',
            success: function(data) {
                populateBoard();
            },
            error: errorMsg
        })
    };

    function retrieveDeck() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/`,
            method: 'GET',
            success: function(data) {
                populateBoard();
                console.log(data);
            },
            error: errorMsg
        })
    };

    function newDeck() {
        $.ajax({
            url: 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1',
            method: 'GET',
            success: function(data) {
                deckID = data['deck_id'];
                populateBoard();
            },
            error: errorMsg
        })
    };

    // creates a new GameBoard and fills it with API data along with custom properties and methods
    // also adds all those new card objects to a deck object
    function populateBoard() {
        $.ajax({
            url: `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`,
            method: 'GET',
            success: function(data) {
                currentBoard = new GameBoard();
                data.cards.map(function(elem) {
                    elem.inPlay = false;
                    elem.addedToPlayPile = false;
                    elem.addToPlay = function() {
                        this.addedToPlayPile = true;
                    }
                    elem.flip = function() {
                        let pngCard = this.images.png
                        let back = './images/cardBack.png';
                        if (elem.image !== back) {
                            elem.image = back;
                            this.inPlay = false;
                        } else {
                            elem.image = pngCard;
                            this.inPlay = true;
                        }
                    }
                });
                for (var i = 0; i < data.cards.length - 1; i++) {
                    data.cards[i].flip()
                    if (i < 28) {
                        nodeObj[i + 1].data = data.cards[i];
                    } else {
                        currentBoard.pile.push(data.cards[i])
                    }
                }
                currentBoard.pile[currentBoard.pile.length - 1].inPlay = true;
                currentBoard.play.push(data.cards[data.cards.length - 1])
                for (var i = 0; i < data.cards.length; i++) {
                    deck[data.cards[i].code] = data.cards[i];
                }
                boardCopy = jQuery.extend(true, {}, currentBoard);
                uncover(currentBoard);


            },
            error: errorMsg
        })
    }

    function errorMsg(error) {
        console.log('Error message on ajax call:', error);
    }

});
