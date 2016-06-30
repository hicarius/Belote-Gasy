angular.module('myApp.directives', [])
.directive('belote', [
    'loaderSvc',
    'Card',
    function (loaderSvc, Card) {
        "use strict";
        return {
            restrict : 'EAC',
            replace : true,
            scope :{
            },
            template: "<canvas width='800' height='600'></canvas>",
            link: function (scope, element, attribute) {
                var stage, easelJsUtils;
                var w, h;

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

                init();

                // Fonction d'initialisation
                function init()
                {
                    if (scope.stage) {
                        scope.stage.autoClear = true;
                        scope.stage.removeAllChildren();
                        scope.stage.update();
                    } else {
                        scope.stage = new createjs.Stage(element[0]);
                    }
                    w = scope.stage.canvas.width;
                    h = scope.stage.canvas.height;

                    scope.stage.enableMouseOver(30); // activer la gestion des événement de survol de la souris
                    easelJsUtils = new EaselJsUtils(scope.stage);

                    //gestion des position
                    preparePosition();
                    loaderSvc.getLoader().addEventListener("complete", loadComplete);
                    loaderSvc.loadAssets();
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
                            var card = new Card({color: color, number: number, x: p_deck.x, y: p_deck.y});
                            card.addToStage(scope.stage);
                            decks.push(card.getCard());//ajout dans le pile
                        });
                    });

                    addPlayer('heri1');
                    addPlayer('heri2');
                    addPlayer('heri3');
                    addPlayer('heri4');

                    //place back decks
                    //easelJsUtils.placeDecks(loaderSvc.getResult("bc_" + playingDeck.color + playingDeck.number), {x: p_deck.x, y: p_deck.y});
                };

                function animatePlayerCard()
                {
                    this.card.cursor = 'pointer';
                    this.card.addEventListener("mouseover", function(event) {
                        createjs.Tween.get(this.card, {override:true}).to({x:this.card.x, y: ps_card.y - 20},100);
                    });
                    this.card.addEventListener("mouseout", function(event) {
                        createjs.Tween.get(this.card, {override:true}).to({x:this.card.x, y: ps_card.y},100);
                    });
                    this.card.addEventListener("click", function(event) {
                        this.card.image = loaderSvc.getResult(this.card.name);
                        this.card.mouseEnabled = false;
                        this.card.removeAllEventListeners();
                        createjs.Tween.get(this.card, {override:true}).to({x:ps_card_table.x, y: ps_card_table.y},100);
                    });
                }

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
                                    card.image = loaderSvc.getResult("bc_" + playingDeck.color + playingDeck.number);
                                    player.x += 10;
                                    break;
                                case 'e' :
                                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                                    card.mouseEnabled = false;
                                    card.image = loaderSvc.getResult("bc_" + playingDeck.color + playingDeck.number);
                                    player.y += 10;
                                    break;
                                case 's' :
                                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                                    player.x += 50;
                                    break;
                                case 'o' :
                                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                                    card.mouseEnabled = false;
                                    card.image = loaderSvc.getResult("bc_" + playingDeck.color + playingDeck.number);
                                    player.y += 10;
                                    break;
                            }
                            //on ajoute dans la main du joueur
                            player.cards.push(card);
                            createjs.Sound.play("cardSlide");
                            //on modifie l'index
                            scope.stage.setChildIndex(card, newIndex++);
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
                        scope.stage.update();
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
            }
        }
    }
    ]);