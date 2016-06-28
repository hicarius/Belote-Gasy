var canvas, stage, easelJsUtils;
var w, h, loader;

var decks = []; //pli des cartes
var scores = []; //tableau des scores
var cardInTable = []; //les 4 cartes sur table

var players = []; //les cartes de joueur 1

var randPlayer = []; //pour savoir la main
var currentFirstPlayer = 0;

var playingDeck = {color: 'blue', number: 5}; //carte à jouer
var p_deck; //position du deck
var ps_card, pn_card, pe_card, po_card; //position du carte des joueur (sud, nord, est, oeust)
var ps_card_table, pn_card_table, pe_card_table, po_card_table; //position du carte des joueur dur table  (sud, nord, est, oeust)




// Initialisation
$(document).ready(function() {
    init();
});

// Fonction d'initialisation
function init()
{
    canvas = $('#card-canvas').get(0);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(30); // activer la gestion des événement de survol de la souris
    easelJsUtils = new EaselJsUtils(stage);

    w = stage.canvas.width;
    h = stage.canvas.height;

    //gestion des position
    preparePosition();

    loader = new createjs.LoadQueue(false);
    var manifest = [
        {src: "spritesheets/playingCards.png", id: "spriteCard"},
        {src: "spritesheets/playingCardBacks.png", id: "spriteBackCard"},
    ];

    //load all card
    $.each( ['c', 'd', 'h', 's'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            manifest.push({src: "cards/card_" + color + number + ".png", id: color + number});
        });
    });

    //load all back card
    $.each( ['blue', 'green', 'red'], function(i, color){
        $.each([1,2,3,4,5], function(x, number){
            manifest.push({src: "cards/cardBack_" + color + number + ".png", id: "bc_" + color + number});
        });
    });
    loader.loadManifest(manifest, true, "../images/");
    loader.addEventListener("complete", loadComplete);
};


function loadComplete()
{
    prepareBord();
    startTicker(30);
};

function preparePosition()
{
    //position du deck
    p_deck = {x: w-115, y: h-153};

    //position des cartes des joueurs
    //nord
    pn_card = {x: (w/2) - 52.5, y: - 78.75};
    pn_card_table = {x: (w/2) - 52.5, y: (h/5) - 50 + 30 };

    //est
    pe_card =  {x: w + 78.75, y: h/4 + 30};
    pe_card_table = {x: (w/2) + 55, y: (pn_card_table.y+80) + 30 };

    //sud = joueur
    ps_card = {x: (w/2) - 52.5, y:500};
    ps_card_table = {x: (w/2) - 52.5, y: (pn_card_table.y+143) + 50 + 30 };

    //ouest
    po_card = {x: 78.75, y: h/4 + 30};
    po_card_table = {x: (w/5) + 80, y: (pn_card_table.y+80) + 30 };
}

function prepareBord()
{
    //create decks
    $.each( ['c', 'd', 'h', 's'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            var name = color+number;
            decks.push(easelJsUtils.createCard(loader.getResult(name), {x: p_deck.x, y: p_deck.y}, name));//ajout dans le pile
        });
    });

    addPlayer('heri1');
    addPlayer('heri2');
    addPlayer('heri3');
    addPlayer('heri4');

    //place back decks
    //easelJsUtils.placeDecks(loader.getResult("bc_" + playingDeck.color + playingDeck.number), {x: p_deck.x, y: p_deck.y});

    //place cards
    //nord
    /*
    easelJsUtils.placeCard(loader.getResult("bc_" + playingDeck.color + playingDeck.number), {x: pn_card.x, y: pn_card.y});
    easelJsUtils.placeCard(loader.getResult("s7"), {x: pn_card_table.x, y: pn_card_table.y});
    //est
    easelJsUtils.placeCard(loader.getResult("bc_" + playingDeck.color + playingDeck.number), {x: pe_card.x, y: pe_card.y, rotation:90 });
    easelJsUtils.placeCard(loader.getResult("c10"), {x: pe_card_table.x, y: pe_card_table.y});
    //sud
    easelJsUtils.placeCard(loader.getResult("cK"), {x: ps_card.x, y: ps_card.y});
    easelJsUtils.placeCard(loader.getResult("dA"), {x: ps_card_table.x, y: ps_card_table.y});
    //ouest
    easelJsUtils.placeCard(loader.getResult("bc_" + playingDeck.color + playingDeck.number), {x: po_card.x, y: po_card.y, rotation:90});
    easelJsUtils.placeCard(loader.getResult("h9"), {x: po_card_table.x, y: po_card_table.y});
    */
};

function partageDeck(num)
{
    var newIndex = 0;
    $.each(randPlayer, function(key, player){
        for(var i = 1; i <= num; i++){
            //on prend la deernière carte
            var card = decks[ decks.length - 1 ];
            createjs.Tween.get(card, {override:true}).to({x:player.x},500);
            //on ajoute dans la main du joueur
            player.cards.push(card);
            //on modifie l'index
            stage.setChildIndex(card, newIndex++);
            //on supprime la carte du deck
            decks.pop();
        }
    });
}

function addPlayer(name)
{
    if( players.length < 4 ){
        var x, y;
        switch(players.length){
            case 0:
                x = ps_card.x; y =ps_card.y; break;
            case 1:
                x =po_card.x; y =po_card.x;break;
            case 2:
                x =pn_card.x; y =pn_card.x;break;
            case 3:
                x =pe_card.x; y =pe_card.x;break;
        }
        myLog('Player ' + name + ' added.');
        players.push({id: players.length+1, name: name, cards: [], x : x, y: y});
    }
    myLog('Players :', players);
    if(players.length == 4){
        startGame();
    }
}

function startGame()
{
    myLog('Game starting...');
    easelJsUtils.shuffle(decks); //pasoana ny karatra

    //choisir le premier à servir
    checkFirstToRun();

    //partageDeck(3);
}


function checkFirstToRun()
{
    for(var i=0; i < 4; i++){
        randPlayer[i] = players[currentFirstPlayer];
        if(currentFirstPlayer >= 3) {
            currentFirstPlayer = 0;
        }else{
            currentFirstPlayer++;
        }
    }
}

// Démarrer le ticker
function startTicker(fps)
{
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener("tick", function(event){
        stage.update();
    });
};

function myLog(txt, data)
{
    if(data != null){
        console.log(txt);
        console.log(data);
    }else{
        console.log(txt);
    }
}
