$(document).ready(function() {

    // IMPORTANT NOTES:
    // * for some reason adblock plugin will cause bugs
    // * first tier is the top tier (3 total cards)
    // * fourth tier is the base of the pyramids
    // * two sources of truth for card data at the moment currentBoard and deck
    // * Alt text doesn't currently change on flipping
    // * how to set up data so that theres one source of truth and site is generated from that
    // TODO: incorporate image changing on addToPlay function
    // TODO: currently flipcheck doesnt keep track of cards that have already been flipped
    // TODO: fix reset button functionality

    let deckID = null;
    let currentBoard = null;
    let deck = null;
    let currentScore = 0;
    let scoreStreak = 0;
    let leftPyramidFinished = false;
    let midPyramidFinished = false;
    let rightPyramidFinished = false;
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
    const firstTier = [1, 11, 20];
    const secondTier = [2, 3, 12, 13, 21, 22];
    const thirdTier = [4, 5, 6, 14, 15, 16, 23, 24, 25];
    const tierFour = [7, 8, 9, 10, 17, 18, 19, 26, 27, 28];
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

    GameBoard.prototype.refresh = function(targetCard, tier) {
        for (var i = 0; i < this[tier].length; i++) {
            if (this[tier][i].code === targetCard) {
                this[tier][i].addToPlay();
                deck[targetCard].addToPlay();
                this.play.push(deck[targetCard]);
            }
        }
    };

    GameBoard.prototype.traverseBF = function(callback) {
        for (var i = 0; i < this.root.length; i++) {

        };
    };

    function CardNode(data, position, children) {
        this.data = data || null;
        this.position = position;
        this.parent = null;
        this.children = children;
    };

    CardNode.prototype.left = () => this.children[0];
    CardNode.prototype.right = () => this.children[1];

    function fetchNodes(arr) {
        let nodeList = [];
        if (arr !== null) {
            arr.forEach(elem => {
                if (!nodeObj[elem]) {
                    let newNode = new CardNode(null, elem, fetchNodes(logicArr[elem]));
                    nodeObj[elem] = newNode;
                    nodeList.push(newNode);
                }
            })
        }
        return nodeList;
    };

    function createBoardStructure() {
        currentBoard = new GameBoard();
    }

    function scoreMultVictoryCheck() {
        for (var i = 0; i < currentBoard['firstTier'].length; i++) {
            console.log(currentBoard['firstTier'][0].addedToPlayPile);
            if (currentBoard['firstTier'][0].addedToPlayPile) {
                switch (i) {
                    case 0:
                        if (!leftPyramidFinished) {
                            currentScore += 15;
                            leftPyramidFinished = true;
                        };
                        break;
                    case 1:
                        if (!midPyramidFinished) {
                            currentScore += 15;
                            midPyramidFinished = true;
                        };
                        break;
                    case 2:
                        if (!rightPyramidFinished) {
                            currentScore += 15;
                            rightPyramidFinished = true;
                        };
                        break;
                };
            }
        };
        if (leftPyramidFinished && midPyramidFinished && rightPyramidFinished) {
            currentScore += 15;
            setTimeout(function() {
                alert(`You won with a score of ${currentScore}!! Try resetting to see if you can do better!`);
            }, 3000);
        }

    };

    function resetScore() {
        currentScore = 0;
        refreshScore();
    }

    function calculateAddScore(targetCard, tier) {
        scoreStreak++;
        currentScore += scoreStreak;
        scoreMultVictoryCheck();
        refreshScore();
    }

    function calculatePileScore() {
        scoreStreak = 0;
        currentScore = currentScore - 5;
        refreshScore();
    }

    function refreshScore() {
        $('#scoreSpan').text(currentScore)
    }

    function log(e) {
        console.log(e.target);
    }

    function pileClick(e) {
        console.log(e.target);
        let topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
        if (deck[topPileCard].inPlay) {
            calculatePileScore();
            renderCardMove(topPileCard);
            turnCardOver(currentBoard.pile.length - 1, 'pile');
            currentBoard.play.push(currentBoard.pile.pop());
            // assign the new topPileCard
            topPileCard = currentBoard.pile[currentBoard.pile.length - 1].code;
            deck[topPileCard].inPlay = true;
        }
    }

    function cardClick(e) {
        let targetCard = e.target.id;
        let targetTier = e.target.alt.split(' ')[0]

        if (deck[targetCard].inPlay) {
            // targetCard at 0 because suit doesnt matter in this game ex: 6D = 6 of diamonds
            if (validMove(targetCard[0])) {
                // replace image on play pile
                renderCardMove(targetCard);

                // update score
                calculateAddScore(targetCard, targetTier);

                // handling targetCard status in both truth objects
                currentBoard.refresh(targetCard, targetTier)

                // if flipInfo.flipNeeded === true, then flip(flipIndex/targetCard, flipTier)
                let flipInfo = flipCheck(targetCard, targetTier);
                if (flipInfo.length > 0) {
                    for (var i = 0; i < flipInfo.length; i++) {
                        turnCardOver(flipInfo[i].flipIndex, flipInfo[i].flipTier);
                    }
                }
            }
        } else {
            console.log('card is not in play');
        }
    }

    function turnCardOver(index, tier) {
        // don't use flip because it will flip back and forth
        let targetCard = currentBoard[tier][index].code;
        deck[targetCard].image = deck[targetCard].images.png;
        $(`#${targetCard}`).attr('src', `${deck[targetCard].image}`);
        deck[targetCard].inPlay = true;
    }

    function renderCardMove(targetCard) {
        $(`#${targetCard}`).addClass('invis');
        $(`.cardBoxplay img`).attr('src', `${deck[targetCard].images.png}`);
    }

    function flipCheck(targetCard, tier) {
        // crawl through tiers on currentBoard to see if anything needs to be flipped
        let tiers = ['firstTier', 'secondTier', 'thirdTier', 'fourthTier'];
        let flipInfo = [];

        if (tier === 'fourthTier') {
            for (var i = 0; i < currentBoard[tier].length - 1; i++) {
                if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                    let flipItem = {};
                    flipItem.flipNeeded = true;
                    flipItem.flipIndex = i;
                    flipItem.flipTier = 'thirdTier';
                    flipInfo.push(flipItem);
                }
            }
        } else if (tier === 'thirdTier') {
            for (var i = 0; i < currentBoard[tier].length - 1; i++) {
                if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                    let flipItem = {};
                    flipItem.flipTier = 'secondTier';
                    flipItem.flipNeeded = true;
                    if (i < 2) {
                        flipItem.flipIndex = i;
                    } else if (i < 5) {
                        flipItem.flipIndex = i - 1;
                    } else {
                        flipItem.flipIndex = i - 2;
                    }
                    if (i === 2 || i === 5) {
                        flipItem.flipNeeded = false;
                    }
                    flipInfo.push(flipItem);
                }
            }
        } else if (tier === 'secondTier') {
            let i = 0;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = i;
                flipInfo.push(flipItem);
            }
            i = 2;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = 1;
                flipInfo.push(flipItem);
            }
            i = 4;
            if (currentBoard[tier][i].addedToPlayPile === true && currentBoard[tier][i + 1].addedToPlayPile === true) {
                let flipItem = {};
                flipItem.flipTier = 'firstTier';
                flipItem.flipNeeded = true;
                flipItem.flipIndex = 2;
                flipInfo.push(flipItem);
            }
        }
        return flipInfo;
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
        // TODO: TEST THIS!!
        if (target === inPlay + 1 || target === inPlay - 1 || (target === 1 && inPlay === 13) || (target === 13 && inPlay === 1)) {
            return true;
        } else {
            console.log('invalid move for inplay card: ', currentBoard.play[currentBoard.play.length - 1].code[0]);
            return false;
        }
    }

    function resetHand() {
        clearStage();
        retrieveDeck();
    }

    function newHand() {
        clearStage();
        resetScore();
        if (deckID !== null) {
            shuffle();
        } else {
            newDeck();
        }
    }

    function clearStage() {
        $('.added').remove();
        $('.cardDiv').remove();
    }

    function uncover(board) {
        popCards(board.pile, 'pile');
        popCards(board.play, 'play');
        for (var i = 0; i < tierFour.length; i++) {
            let tierFourCard = nodeObj[tierFour[i]].data;
            tierFourCard.flip();
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
        popNodeArray(firstTier);
        popNodeArray(secondTier);
        popNodeArray(thirdTier);

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
        // TODO: make card face hidden
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
    function popCards(cardArr, tier) {
        if (tier === 'pile') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                if (i > 0) {
                    $cardDiv.addClass('pile');
                }
                $cardDiv.append($card);
                $(`.cardBox${tier}`).append($cardDiv);
            }
        } else if (tier === 'play') {
            for (var i = 0; i < cardArr.length; i++) {
                let $card = $('<img></img>');
                let $cardDiv = $('<div></div>');
                $cardDiv.addClass('cardDiv');
                $card.addClass('card added')
                    .attr('id', cardArr[i].code)
                    .attr('src', cardArr[i]['image'])
                    .attr('alt', `${tier} Back of playing card`);
                $cardDiv.append($card);
                $(`.cardBox${tier}`).append($cardDiv);
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


                createBoardStructure();

                // adds flip to each card object, cant get prototype thing to work
                data.cards.map(function(elem) {
                    elem.inPlay = false;
                    // elem.boardLoc = null;
                    elem.addedToPlayPile = false;
                    elem.addToPlay = function() {
                        this.addedToPlayPile = true;
                        // this.boardLoc = 'play'
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
                currentBoard.play.push(data.cards[data.cards.length - 1])
                    // first 28 cards thrown into pyramids
                uncover(currentBoard);

            },
            error: errorMsg
        })
    }

    function errorMsg(error) {
        console.log('Error message on ajax call:', error);
    }

});
