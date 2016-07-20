var canvas, stage, easelJsUtils;
var w, h, loader;

var cards = []; //les cartes
var decks = []; //pli des cartes
var scores = [], score_1, score_2; //tableau des scores
var cardInTable = []; //les 4 cartes sur table

var players = []; //les cartes de joueur 1
var equips =  [[], []]; //les cartes de joueur 1

var decks_equip1, decks_equip2; //les plis

var userFirst = null, userSplitter = null, userDivider= null, userIdle = null;
var firstCard = 0, idleCard = 0, splitterCard = 0, dividerCard = 0;
var playerToPartageCard = 1;

var currentPlayerToPartageCard = 1; //reset à chaque partie

var p_deck, firstBoard; //position du deck
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
        {src: "images/cards-1/back.png", id: "back"},
		{src: "images/first.png", id: "first"},
        {src: "images/bar-button.png", id: "bar-button"},
        {src: "images/first.png", id: "first"},
        {src: "images/player-bg.png", id: "player-bg"},
        {src: "sound/cardPlace1.mp3", id: "cardPlace"},
        {src: "sound/cardSlide1.mp3", id: "cardSlide"},
    ];

    //load all card
    $.each( ['tr', 'ca', 'co', 'pi'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            manifest.push({src: "images/cards-1/" + color + number + ".png", id: color + number});
        });
    });
    ;
    loader.installPlugin(createjs.Sound);
    loader.loadManifest(manifest, true, "/assets/");
    loader.addEventListener("complete", function(){
        websocket.send( JSON.stringify({type: "game/loadcomplete"}));
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", function(event){
            stage.update();
        });
    });
};


function preparePosition()
{
    //position du deck
    p_deck = {x: 373, y: 240};

    //position des cartes des joueurs
    //nord
    pn_card = {x: 375, y: - 10, rotation: 40};
    pn_card_table = {x: 370, y: 175, rotation: 0 };
	pn_first_palette = {x: 420,y: 5};
    pn_card_single = [
        {x:390, y:25, rotation:90},
        {x:387, y:35, rotation:80},
        {x:385, y:40, rotation:65},
        {x:383, y:45, rotation:50},
        {x:375, y:50, rotation:25},
        {x:380, y:60, rotation:5},
        {x:460, y:120, rotation:160},
        {x:485, y:90, rotation:135},
    ];

    //est
    pe_card =  {x: 780, y: 240, rotation: 130};
    pe_card_table = {x: 440, y: 225, rotation: 0 };
	pe_first_palette = {x: 757,y: 220};
    pe_card_single = [
        {x:720, y:200, rotation:0},
        {x:770, y:265, rotation:165},
        {x:765, y:264, rotation:155},
        {x:760, y:257, rotation:135},
        {x:755, y:255, rotation:115},
        {x:748, y:255, rotation:95},
        {x:735, y:255, rotation:70},
        {x:730, y:265, rotation:45},
    ];

    //sud = joueur
    ps_card = {x: (w/2) - 52.5 - 200, y:500};
    ps_card_table = {x: 370, y: 275, rotation: 0 };
	ps_first_palette = {x: 98,y: 552};
    ps_card_single = [		
		{x:250, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:300, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:350, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:400, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:450, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:500, y:580, rotation:180, scale:[0.8, 0.8]},
        {x:550, y:580, rotation:180, scale:[0.8, 0.8]},
		{x:600, y:580, rotation:180, scale:[0.8, 0.8]},
    ];

    //ouest
    po_card = {x: 75, y: 185, rotation: 50};
    po_card_table = {x: 300, y: 225, rotation: 0 };
	po_first_palette = {x: 5,y: 220};
    po_card_single = [
        {x:25, y:275, rotation:0},
        {x:100, y:330, rotation:160},
        {x:120, y:305, rotation:140},
        {x:127, y:280, rotation:120},
        {x:127, y:245, rotation:100},
        {x:110, y:215, rotation:70},
        {x:85, y:200, rotation:50},
        {x:55, y:190, rotation:30},
    ];

    //position du pli
    decks_equip1 = {x: 200, y: 50, rotation:0};
    decks_equip2 = {x: 150, y: 385, rotation: 90};

    var equiPlayer = 0;
    $.each(equips, function(equipId, users){
        $.each(users, function(i, userId){
            if(userId == uid){
                equiPlayer = equipId;
            }
        });
    });

    var playerPosition;
    //Position de player et son partenaire
    $.each(equips[equiPlayer], function(i, userId){
        if(uid == userId){//player
            $.each(players, function(x, user){
                if (userId == user.id) { //player
                    user.orientation = 's';
                    user.x = ps_card.x;
                    user.y = ps_card.y;
					user.first_palette = ps_first_palette;
                    user.equip = equiPlayer;
                    playerPosition = user.position;
                }
            });
        }else{ //votre partenaire
            $.each(players, function(x, user){
                if (userId == user.id) { //player
                    user.orientation = 'n';
                    user.x = pn_card.x;
                    user.y = pn_card.y;
					user.first_palette = pn_first_palette;
                    user.equip = equiPlayer;
					user.rotation = pn_card.rotation;
                }
            });
        }
    });

    //Position de l'adversaire
    var equipAdv = (equiPlayer==0) ? 1 : 0;
    $.each(equips[equipAdv], function(i, userId){
        $.each(players, function(x, user){
            if (userId == user.id) {
                switch (playerPosition){
                    case 1:
                        if(user.position == 2){user.orientation = 'e';}else{user.orientation = 'o';}
                        break;
                    case 2:
                        if(user.position == 3){user.orientation = 'e';}else{user.orientation = 'o';}
                        break;
                    case 3:
                        if(user.position == 4){user.orientation = 'e';}else{user.orientation = 'o';}
                        break;
                    case 4:
                        if(user.position == 1){user.orientation = 'e';}else{user.orientation = 'o';}
                        break;
                }
				user.first_palette = (user.orientation == 'e') ? pe_first_palette : po_first_palette ;
				user.rotation = (user.orientation == 'e') ? pe_card.rotation : po_card.rotation;
                user.x = (user.orientation == 'e') ? pe_card.x : po_card.x;
                user.y = (user.orientation == 'e') ? pe_card.y : po_card.y;
                user.equip = equipAdv;
            }
        });
    });
}

function prepareBord(deckData)
{
    //create decks
    $.each( deckData, function(i, item){
        cards.push( easelJsUtils.createCard(loader.getResult('back'), {x: p_deck.x, y: p_deck.y, scale:[0.5, 0.5]}, item) );
		//decks.push(card);
    });

    //create affichage score
    score_1 = easelJsUtils.createText("E1 : 0/1500", {font: "14px Arial", x:700, y:20});
    score_2 = easelJsUtils.createText("E2 : 0/1500", {font: "14px Arial", x:700, y:40});

    //create screen
    var bg_n = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:357.5, y:0}, 'bg_n');
	bg_n.mouseEnabled = false;
    var text_n = easelJsUtils.createText("", {color: "#FFF", font: "15px Arial", x:387, y:77});
	
    var bg_o = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:0, y:225}, 'bg_o');
    bg_o.mouseEnabled = false;
	var text_o = easelJsUtils.createText("", {color: "#FFF", font: "15px Arial", x:29, y:302});

    var bg_e = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:700, y:225}, 'bg_e');
    bg_e.mouseEnabled = false;
	var text_e = easelJsUtils.createText("", {color: "#FFF", font: "15px Arial", x:729, y:302});

	$.each(players, function(x, user){
		switch (user.orientation){
			case 'n':
				text_n.text = user.name;
				break;
			case 'o':
				text_o.text = user.name;
				break;
			case 'e':
				text_e.text = user.name;
				break;
		}
	});

    easelJsUtils.createBitmap(loader.getResult('bar-button'), {x:80, y:560}, 'bar_button');

    firstBoard = easelJsUtils.createBitmap(loader.getResult('first'), {x: 0, y: 0}, 'first');
    firstBoard.mouseEnabled = false;

	websocket.send( JSON.stringify({type: "game/card/prepareSplit"}));
};

function addPlayer(userId, name, position)
{
    players.push({id: userId, position: position, numberCard: 0, orientation:'', name: name, cards: [], x : 0, y: 0});
}

function addPlayerToEquip(userId, equipId)
{
    equips[equipId].push(userId);
}

function checkFirstToRun(first, divider, splitter)
{
    numberCardFirst = 0;
    numberCardIdle = 0;
    numberCardSplitter = 0;
    numberCardDivider = 0;

	$.each(players, function(x, user){
        if(user.position == splitter){
            userSplitter = user;
            user.isFirst = false;
            user.isIdle =  false;
            user.isSplitter =  true;
            user.isDivider = false;
        }
		if(user.position == divider){
            userDivider = user;
            user.isFirst = false;
            user.isIdle =  false;
            user.isSplitter =  false;
            user.isDivider = true;
		}
        if (user.position == first) {
            userFirst = user;
            user.isFirst = true;
            user.isIdle =  false;
            user.isSplitter =  false;
            user.isDivider = false;
            createjs.Tween.get(firstBoard, {override: true}).to({
                x: user.first_palette.x,
                y: user.first_palette.y
            }, 500);
        }
        if(user.position != first && user.position != divider && user.position != splitter ){
            userIdle = user;
            user.isFirst = false;
            user.isIdle =  true;
            user.isSplitter =  false;
            user.isDivider = false;
        }
	});


}

function showAction(action)
{
    $('#actions').show();
    switch(action){
        case 'splitter':
            $('.action .splitter').show();
            break;
        case 'divider':
            $('.action .divider-2,.action .divider-3 ').show();
            break;
        case 'appel':
            $('.action .appel').show();
            $('.m-appel').attr('disabled', false);
            $('.m-appel.sc').attr('disabled', true);
            break;

    }
}

function hideAction()
{
    $('#actions').hide();
    $('.splitter, .divider-2, .divider-3, .appel').hide();
}

function showSplitBlock()
{
    hideAction();
    showAction('splitter');
}

function showDiviseBlock()
{
    hideAction();
    showAction('divider');
}

function diviseCard(userId, cardName, nextPlayerToPartageCard)
{
	var player, key = 0;

	$.each(players, function(x, user){
		if(user.id == userId){
			player = user;
			key = user.numberCard;
			user.numberCard++;
			return false;
		}
	});	
	
	var card;
	$.each(cards, function(x, carte){
		if(carte.name == cardName){
			card = carte;
			return false;
		}
	});

    card.key = key;

	switch (player.orientation){
		case 'n' :
            card.mouseEnabled = false;
			createjs.Tween.get(card, {override:true}).to({x : card.x-100, y: card.y-20, scaleX: 1, scaleY: 1},300).to({x: pn_card_single[key].x, y: pn_card_single[key].y, rotation: pn_card_single[key].rotation, scaleX: 0.5, scaleY: 0.5},500);
			break;
		case 'e' :
            card.mouseEnabled = false;
			createjs.Tween.get(card, {override:true}).to({x : card.x-100, y: card.y-20, scaleX: 1, scaleY: 1},300).to({x: pe_card_single[key].x, y: pe_card_single[key].y, rotation: pe_card_single[key].rotation, scaleX: 0.5, scaleY: 0.5},500);
			break;
		case 's' :
			createjs.Tween.get(card, {override:true}).to({x : card.x-100, y: card.y-20, scaleX: 1, scaleY: 1},300).to({x:ps_card_single[key].x, y: ps_card_single[key].y, rotation: ps_card_single[key].rotation, scaleX: ps_card_single[key].scale[0], scaleY: ps_card_single[key].scale[1]},500);
			//card.mouseEnabled = true;
			card.image = loader.getResult(card.name);
            console.log(card);
			card.addEventListener("mouseover", function(event) {
				createjs.Tween.get(card, {override:true}).to({x:ps_card_single[card.key].x, y: ps_card_single[card.key].y - 20},100);
			});
			card.addEventListener("mouseout", function(event) {
				createjs.Tween.get(card, {override:true}).to({x:ps_card_single[card.key].x, y: ps_card_single[card.key].y},100);
			});
			card.addEventListener("click", function(event) {
				card.mouseEnabled = false;
				card.removeAllEventListeners();
                websocket.send(JSON.stringify({type: "game/card/placed", userId: uid, cardName: card.name}));

                //disable all card
                $.each(players, function(x, user){
                    if(uid == user.id){
                        $.each(user.cards, function(k, card){
                           disableCard(card);
                        });
                        return false;
                    }
                });

			});
			//player.x += 60;
			break;
		case 'o' :
            card.mouseEnabled = false;
			createjs.Tween.get(card, {override:true}).to({x : card.x-100, y: card.y-20, scaleX: 1, scaleY: 1},300).to({x: po_card_single[key].x, y: po_card_single[key].y, rotation: po_card_single[key].rotation, scaleX: 0.5, scaleY: 0.5},500);
			break;
	}    

	//on ajoute dans la main du joueur
	createjs.Sound.play("cardPlace");
	//on modifie l'index
    newIndex ++;

    player.cards.push(card);

	stage.setChildIndex(card, newIndex);

    currentPlayerToPartageCard = nextPlayerToPartageCard;
}

function placedCard(userId, userPosition, cardName)
{
    var currentUser;
    var card;
    var position;

    $.each(players, function(x, user){
        if(user.id == userId){
            currentUser = user;
            return false;
        }
    });
    switch(currentUser.orientation){
        case 's': position = ps_card_table;break;
        case 'n': position = pn_card_table;break;
        case 'o': position = po_card_table;break;
        case 'e': position = pe_card_table;break;
    }

    $.each(cards, function(x, carte){
        if(carte.name == cardName){
            card = carte;
            return false;
        }
    });

    createjs.Sound.play("cardSlide");
    card.image = loader.getResult(cardName);
    createjs.Tween.get(card, {override:true}).to({x:position.x, y: position.y, rotation: 0, scaleX: 0.6, scaleY: 0.6},100);
    cardInTable.push(card);
}

function showAppelBlock(inputToEnabled)
{
    hideAction();
    showAction('appel');
    $('.m-appel').attr('disabled', true);

    $.each(inputToEnabled, function(i, inputClass){
        $('.m-appel.' + inputClass).attr('disabled', false);
    });
}

function appel(userId, appel, nextAppeller)
{
    showAppel(nextAppeller);
}

function removeInTable(winnerPosition)
{
    var position;

    if(winnerPosition == 1 || winnerPosition == 3){
        position = decks_equip1;
    }else{
        position = decks_equip2;
    }

    $.each(cardInTable, function(x, card){
        card.image = loader.getResult('back');
        createjs.Tween.get(card, {override:true}).to({x:position.x, y: position.y, rotation: position.rotation, scaleX: 0.3, scaleY: 0.3},500);
    });
    cardInTable = [];
}

function showScore(e1, e2)
{
    score_1.text = "E1 : " + e1 + "/1500";
    score_2.text = "E2 : " + e2 + "/1500";

    preparePosition();

    $.each(cards, function(x, card){
        createjs.Tween.get(card, {override:true}).to({x: p_deck.x, y: p_deck.y, rotation: 0, scaleX: 0.5, scaleY: 0.5},100);
    });
	
	$.each(players, function(x, user){
        user.numberCard = 0;
    });

    switch (playerToPartageCard){
        case 1: currentPlayerToPartageCard = 2; break;
        case 2: currentPlayerToPartageCard = 3; break;
        case 3: currentPlayerToPartageCard = 4; break;
        case 4: currentPlayerToPartageCard = 1; break;
    }

    newIndex = 1;
}

function activateCard()
{
    $.each(players, function(x, user){
        if(uid == user.id){
            $.each(user.cards, function(k, card){
                enableCard(card);
            });
            return false;
        }
    });
}

function disableCard(card)
{
    card.filters = [
        new createjs.ColorFilter(0.5, 0.5, 0.5, 1, 0, 0, 0, 0.5)
    ];
    card.cache(0, 0, 105, 143);
    card.mouseEnabled = false;
}

function enableCard(card)
{
    card.filters = [];
    card.cache(0, 0, 105, 143);
    card.mouseEnabled = true;
}
