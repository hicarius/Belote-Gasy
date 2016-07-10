var canvas, stage, easelJsUtils;
var w, h, loader;

var cards = []; //les cartes
var decks = []; //pli des cartes
var scores = []; //tableau des scores
var cardInTable = []; //les 4 cartes sur table

var players = []; //les cartes de joueur 1
var equips =  [[], []]; //les cartes de joueur 1

var randPlayer = []; //pour savoir la main
var currentFirstPlayer = 0;

var playingDeck = {color: 'blue', number: 5}; //carte à jouer
var p_deck, firstBoard; //position du deck
var ps_card, pn_card, pe_card, po_card; //position du carte des joueur (sud, nord, est, oeust)
var ps_card_table, pn_card_table, pe_card_table, po_card_table; //position du carte des joueur dur table  (sud, nord, est, oeust)

var newIndex = 100;

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
		{src: "images/first.png", id: "first"},
        {src: "images/player-bg.png", id: "player-bg"},
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
    p_deck = {x: w/2 - 50, y: h/2 - 60};

    //position des cartes des joueurs
    //nord
    pn_card = {x: (w/2) - 52.5, y: - 52.75};
    pn_card_table = {x: (w/2) - 52.5, y: (h/5) - 50 + 30 };
	pn_first_palette = {x: 385,y: 15};

    //est
    pe_card =  {x: w + 52.75, y: h/4 + 30};
    pe_card_table = {x: (w/2) + 55, y: (pn_card_table.y+80) + 30 };
	pe_first_palette = {x: 757,y: 272};

    //sud = joueur
    ps_card = {x: (w/2) - 52.5 - 200, y:500};
    ps_card_table = {x: (w/2) - 52.5, y: (pn_card_table.y+143) + 50 + 30 };
	ps_first_palette = {x: 385,y: 560};

    //ouest
    po_card = {x: 52.25, y: h/4 + 30};
    po_card_table = {x: (w/5) + 80, y: (pn_card_table.y+80) + 30 };
	po_first_palette = {x: 757,y: 6};

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
					user.rotation = 20;
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
				user.rotation = (user.orientation == 'e') ? 130 : 50 ;
                user.x = po_card.x;
                user.y = po_card.y;
                user.equip = equipAdv;
            }
        });
    });
}

function prepareBord(deckData)
{
    //create decks
    $.each( deckData, function(i, item){
        var card = easelJsUtils.createCard(loader.getResult(item), {x: p_deck.x, y: p_deck.y}, item);
        cards[item] = card;
		decks.push(card);
    });

    //create screen
    var bg_n = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:pn_card.x + 10, y:pn_card.y+25}, 'bg_n');
	bg_n.mouseEnabled = false;
    var text_n = easelJsUtils.createText("", {font: "14px Arial", x:bg_n.x + 25, y:bg_n.y+30});    
	
    var bg_o = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:po_card.x - 75, y:po_card.y+50}, 'bg_o');
    bg_o.mouseEnabled = false;
	var text_o = easelJsUtils.createText("", {font: "14px Arial", x:bg_o.x + 25, y:bg_o.y+30});
	
    var bg_e = easelJsUtils.createBitmap(loader.getResult('player-bg'), {x:pe_card.x - 125, y:pe_card.y+50}, 'bg_e');
    bg_e.mouseEnabled = false;
	var text_e = easelJsUtils.createText("", {font: "14px Arial", x:bg_e.x + 25, y:bg_e.y+30});
	
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
	
	websocket.send( JSON.stringify({type: "game/card/prepareSplit"}));
};

function partageDeck(num)
{
    $.each(randPlayer, function(key, player){
        for(var i = 1; i <= num; i++){
            //on prend la dernière carte
            var card = decks[ decks.length - 1 ];
            switch (player.orientation){
                case 'n' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                    player.x += 10;
                    break;
                case 'e' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    player.y += 10;
                    break;
                case 's' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
                    card.mouseEnabled = true;
                    card.image = loader.getResult(card.name);
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
                    player.x += 60;
                    break;
                case 'o' :
                    createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y, rotation: 90},500);
                    player.y += 10;
                    break;
            }
            //on ajoute dans la main du joueur
            //player.cards.push(card);
            createjs.Sound.play("cardPlace");
            //on modifie l'index
            stage.setChildIndex(card, newIndex++);
            //on supprime la carte du deck
            decks.pop();
        }
    });
}

function addPlayer(userId, name, position)
{
    players.push({id: userId, position: position, orientation:'', name: name, cards: [], x : 0, y: 0});
}

function addPlayerToEquip(userId, equipId)
{
    equips[equipId].push(userId);
}

function checkFirstToRun(first, divider, splitter)
{
	var u_first, u_splitter, u_divider;
	$.each(players, function(x, user){
		if(user.position == first){
			u_first = user;
		}
		if(user.position == splitter){
			u_splitter = user;
		}
		if(user.position == divider){
			u_divider = user;
		}
	});	
	
	if(uid == u_splitter.id){
		showAction('splitter');
	}
	
	if(uid == u_first.id){		
		createjs.Tween.get(firstBoard, {override:true}).to({x:u_first.first_palette.x, y: u_first.first_palette.y},500);
	}
}

function showAction(action)
{
	switch(action){
		case 'splitter':
			$('.action .splitter').show();
			break;
		case 'divider':
			$('.action .divider').show();
			break;

	}
}

function checkDiviseAction(deckData, dividerPosition)
{
	//suppression d'ancien decks
	decks = [];
	
    //create decks	
    $.each( deckData, function(i, item){
        decks.push(cards[item]);
    });	
	
	$.each(players, function(x, user){
		if(user.position == dividerPosition){
			u_divider = user;
			return false;
		}
	});	
	
	if(uid == u_divider.id){
		showAction('divider');
	}
	$('.action .splitter').hide();
}

function diviseCard(userId, cardName)
{
	var player;
	$.each(players, function(x, user){
		if(user.id == userId){
			player = user;
			return false;
		}
	});
	
	var card;
	$.each(decks, function(x, carte){
		if(carte.name == cardName){
			card = carte;
			return false;
		}
	});
console.log(card);
	switch (player.orientation){
		case 'n' :
			createjs.Tween.get(card, {override:true}).to({x:player.x, y: 40, rotation: player.rotation},500);
			player.x += 10;
			player.rotation -= 10;
			break;
		case 'e' :
			createjs.Tween.get(card, {override:true}).to({x:750, y: player.y, rotation: player.rotation},500);
			player.y += 10;
			player.rotation -= 20;
			break;
		case 's' :
			createjs.Tween.get(card, {override:true}).to({x:player.x, y: player.y},500);
			card.mouseEnabled = true;
			card.image = loader.getResult(card.name);
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
			player.x += 60;
			break;
		case 'o' :
			createjs.Tween.get(card, {override:true}).to({x:150, y: player.y, rotation: player.rotation},500);
			player.y += 10;
			player.rotation += 10;
			break;
	}
	
	//on ajoute dans la main du joueur
	player.cards.push(card);
	createjs.Sound.play("cardPlace");
	//on modifie l'index
	stage.setChildIndex(card, newIndex++);
	//on supprime la carte du deck
	//decks.pop();
}
