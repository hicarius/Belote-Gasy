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

var newIndex = 0;




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
        {src: "images/spritesheets/playingCards.png", id: "spriteCard"},
        {src: "images/spritesheets/playingCardBacks.png", id: "spriteBackCard"},
        {src: "sound/cardPlace1.mp3", id: "cardPlace"},
        {src: "sound/cardSlide1.ogg", id: "cardSlide"},
    ];

    //load all card
    $.each( ['c', 'd', 'h', 's'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            manifest.push({src: "images/cards/card_" + color + number + ".png", id: color + number});
        });
    });

    //load all back card
    $.each( ['blue', 'green', 'red'], function(i, color){
        $.each([1,2,3,4,5], function(x, number){
            manifest.push({src: "images/cards/cardBack_" + color + number + ".png", id: "bc_" + color + number});
        });
    });
    loader.installPlugin(createjs.Sound);
    loader.loadManifest(manifest, true, "/assets/");
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
    ps_card = {x: (w/2) - 52.5 - 200, y:500};
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
            var card = easelJsUtils.createCard(loader.getResult(name), {x: p_deck.x, y: p_deck.y}, name);
            card.addEventListener("mouseover", function(event) {
                createjs.Tween.get(card, {override:true}).to({x:card.x, y: ps_card.y - 20},100);
            })
            card.addEventListener("mouseout", function(event) {
                createjs.Tween.get(card, {override:true}).to({x:card.x, y: ps_card.y},100);
            })
            card.addEventListener("click", function(event) {
                card.image = loader.getResult(card.name);
                card.mouseEnabled = false;
                card.removeAllEventListeners();
                createjs.Tween.get(card, {override:true}).to({x:ps_card_table.x, y: ps_card_table.y},100);
            })
            decks.push(card);//ajout dans le pile
        });
    });

    addPlayer('heri1');
    addPlayer('heri2');
    addPlayer('heri3');
    addPlayer('heri4');

    //place back decks
    easelJsUtils.placeDecks(loader.getResult("bc_" + playingDeck.color + playingDeck.number), {x: p_deck.x, y: p_deck.y});
};

function partageDeck(num)
{
    $.each(randPlayer, function(key, player){
        for(var i = 1; i <= num; i++){
            //on prend la dernière carte
            var card = decks[ decks.length - 1 ];
            switch (player.position){
                case 'n' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                    card.mouseEnabled = false;
                    card.image = loader.getResult("bc_" + playingDeck.color + playingDeck.number);
                    player.x += 10;
                    break;
                case 'e' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    card.mouseEnabled = false;
                    card.image = loader.getResult("bc_" + playingDeck.color + playingDeck.number);
                    player.y += 10;
                    break;
                case 's' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                    player.x += 50;
                    break;
                case 'o' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    card.mouseEnabled = false;
                    card.image = loader.getResult("bc_" + playingDeck.color + playingDeck.number);
                    player.y += 10;
                    break;
            }
            //on ajoute dans la main du joueur
            player.cards.push(card);
            createjs.Sound.play("cardPlace");
            //on modifie l'index
            stage.setChildIndex(card, newIndex++);
            //on supprime la carte du deck
            decks.pop();
        }
    });
}

function placeCard(player, card)
{

}

function addPlayer(name)
{
    if( players.length < 4 ){
        var x, y, position;
        switch(players.length){
            case 0:
                x = ps_card.x; y =ps_card.y; position = 's'; break;
            case 1:
                x =po_card.x; y =po_card.y; position = 'o';break;
            case 2:
                x =pn_card.x; y =pn_card.y; position = 'n';break;
            case 3:
                x =pe_card.x; y =pe_card.y; position = 'e';break;
        }
        myLog('Player ' + name + ' added.');
        players.push({id: players.length+1, position: position, name: name, cards: [], x : x, y: y});
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
    partageDeck(2);
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
