var canvas, stage, easelJsUtils;
var w, h, loader;

var decks = []; //pli des cartes
var scores = []; //tableau des scores
var cardInTable = []; //les 4 cartes sur table

var players = []; //les cartes de joueur 1
var equips =  [[], []]; //les cartes de joueur 1

var randPlayer = []; //pour savoir la main
var currentFirstPlayer = 0;

var playingDeck = {color: 'blue', number: 5}; //carte à jouer
var p_deck; //position du deck
var ps_card, pn_card, pe_card, po_card; //position du carte des joueur (sud, nord, est, oeust)
var ps_card_table, pn_card_table, pe_card_table, po_card_table; //position du carte des joueur dur table  (sud, nord, est, oeust)

var newIndex = 0;

// Fonction d'initialisation
function initGame()
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
        {src: "images/back.png", id: "back"},
        {src: "sound/cardPlace1.mp3", id: "cardPlace"},
    ];

    //load all card
    $.each( ['tr', 'ca', 'co', 'pi'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            manifest.push({src: "images/" + color + number + ".png", id: color + number});
        });
    });
    ;
    loader.installPlugin(createjs.Sound);
    loader.loadManifest(manifest, true, "/assets/");
    loader.addEventListener("complete", loadComplete);
};


function loadComplete()
{
    websocket.send( JSON.stringify({type: "game/loadcomplete"}));
    startTicker(30);
};

function preparePosition()
{
    //position du deck
    p_deck = {x: w/2 - 50, y: h/2 - 60};

    //position des cartes des joueurs
    //nord
    pn_card = {x: (w/2) - 52.5, y: - 52.75};
    pn_card_table = {x: (w/2) - 52.5, y: (h/5) - 50 + 30 };

    //est
    pe_card =  {x: w + 52.75, y: h/4 + 30};
    pe_card_table = {x: (w/2) + 55, y: (pn_card_table.y+80) + 30 };

    //sud = joueur
    ps_card = {x: (w/2) - 52.5 - 200, y:500};
    ps_card_table = {x: (w/2) - 52.5, y: (pn_card_table.y+143) + 50 + 30 };

    //ouest
    po_card = {x: 52.25, y: h/4 + 30};
    po_card_table = {x: (w/5) + 80, y: (pn_card_table.y+80) + 30 };


    var equiPlayer = 0;
    $.each(equips, function(equipId, users){
        $.each(users, function(i, user){
            if(user.id == uid){
                equiPlayer = equipId;
            }
        });
    });

    var x, y, position;
    //Position de player et son partenaire
    $.each(equips[equiPlayer], function(i, userId){
        if(uid == userId){//player
            $.each(players, function(x, user){
                if (userId == user.id) { //player
                    players.position = 's';
                    players.x = ps_card.x;
                    players.y = ps_card.y;
                }
            });
        }else{ //votre partenaire
            $.each(players, function(x, user){
                if (userId == user.id) { //player
                    players.position = 'n';
                    players.x = pn_card.x;
                    players.y = pn_card.y;
                }
            });
        }
    });

    //Position de l'adversaire
    var advEquip = (equiPlayer==0) ? 1 : 0;
    $.each(equips[advEquip], function(i, userId){
        $.each(players, function(x, user){
            if (userId == user.id) {
                if(i == 0) {
                    players.position = 'o';
                    players.x = po_card.x;
                    players.y = po_card.y;
                }else{
                    players.position = 'e';
                    players.x = pe_card.x;
                    players.y = pe_card.y;
                }
            }
        });
    });
}

function prepareBord(deckData)
{
    //create decks
    $.each( deckData, function(i, item){
            var card = easelJsUtils.createCard(loader.getResult(item), {x: p_deck.x, y: p_deck.y}, item);
            decks.push(card);

            /*
            card.addEventListener("mouseover", function(event) {
                createjs.Tween.get(card, {override:true}).to({x:card.x, y: ps_card.y - 20},100);
            });
            card.addEventListener("mouseout", function(event) {
                createjs.Tween.get(card, {override:true}).to({x:card.x, y: ps_card.y},100);
            });
            card.addEventListener("click", function(event) {
                card.image = loader.getResult(card.name);
                card.mouseEnabled = false;
                card.removeAllEventListeners();
                createjs.Tween.get(card, {override:true}).to({x:ps_card_table.x, y: ps_card_table.y},100);
            });
             */
    });

    //place back decks
    var back = easelJsUtils.placeDecks(loader.getResult("back"), {x: p_deck.x, y: p_deck.y});
    back.removeAllEventListeners();

    //websocket.send( JSON.stringify({type: "game/addplayer"}));
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
                    card.image = loader.getResult("back");
                    player.x += 10;
                    break;
                case 'e' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    card.mouseEnabled = false;
                    card.image = loader.getResult("back");
                    player.y += 10;
                    break;
                case 's' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                    player.x += 60;
                    break;
                case 'o' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    card.mouseEnabled = false;
                    card.image = loader.getResult("back");
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

function addPlayer(userId, name)
{
    players.push({id: userId, position: '', name: name, cards: [], x : 0, y: 0});
}

function addPlayerToEquip(userId, equipId)
{
    equips[equipId].push(userId);
}

/*
function startGame()
{
    //choisir le premier à servir
    checkFirstToRun();

    //partageDeck(3);
    partageDeck(2);
    //partageDeck(3);
}
*/


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
