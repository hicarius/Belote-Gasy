$(function(){
    $('body').on('click', '.create-room', function(){
        websocket.send( JSON.stringify({type: "room/create"}));
        $('.create-room').hide();
        userHasRoom = true;
    });
    $('body').on('click', '.room-out', function(){
        websocket.send( JSON.stringify({type: "room/userleave", roomId: $(this).attr('rel')}));
        websocket.send( JSON.stringify({type: "room/countDown/stop", roomId: $(this).attr('rel')}));
        $('.create-room').show();
        userHasRoom = false;
    });
    $('body').on('click', '.room-in', function(){
        websocket.send( JSON.stringify({type: "room/userjoin", roomId:$(this).attr('rel')}));
        $('.create-room').hide();
        userHasRoom = true;
    });

    $('body').on('click', '.disconnect', function(){
        websocket.close();
        document.location.href = '/';
    });
	
	$('body').on('click', '.divider-2', function(){
        websocket.send( JSON.stringify({type: "game/card/divise", number:2, userPosition:currentPlayerToPartageCard}));
        switch (currentPlayerToPartageCard){
            case 1: numberCardFirst += 2; break;
            case 2: numberCardSecond += 2; break;
            case 3: numberCardTierce += 2; break;
            case 4: numberCardLast += 2; break;
        }
        if(numberCardLast == 5){
            hideAction();
            websocket.send( JSON.stringify({type: 'game/card/showAppel', appeller: 1}));
        }
    });

    $('body').on('click', '.divider-3', function(){        
		websocket.send(JSON.stringify({
			type: "game/card/divise",
			number: 3,
			userPosition: currentPlayerToPartageCard
		}));

        switch (currentPlayerToPartageCard){
            case 1: numberCardFirst += 3; break;
            case 2: numberCardSecond += 3; break;
            case 3: numberCardTierce += 3; break;
            case 4: numberCardLast += 3; break;
        }
        if(numberCardLast == 5){
            hideAction();
            websocket.send( JSON.stringify({type: 'game/card/showAppel', appeller: 1}));
        }
    });
	
	$('body').on('click', '.splitter', function(){
        hideAction();
        websocket.send( JSON.stringify({type: "game/card/split", number:12}));
    });

    $('body').on('click', '.m-appel', function(){
        var nextAppeller;
        var appel = $(this).attr('class').replace('m-appel ', '');
        hideAction();
        websocket.send( JSON.stringify({type: "game/card/appel", appel: appel }));
    });
});

function debug(debug)
{
    $('#console').prepend(debug + '<br />');
}

function createRoomHtml(roomId, room)
{
    var html = '<li>' +
        '<div class="well well-sm" id="' + roomId + '">' +
        '<ul class="room-container">';

    //Les cases avec user
    var totalUser = 0;
    var users = [];
    $.each(room, function(i, user){
        html += '<li id="U' + user.data.id + '" class="room-user">' +
                    '<i class="avatar av-f1 col-xs-12"></i>' +
                    '<span class="u-name col-xs-12">' + user.data.name + '</span>';
        if(uid == user.data.id) {
            html += '<button class="btn btn-xs btn-danger col-xs-12 room-out" rel="' + roomId + '">Sortir</button>';
        }
        html += '</li>';
        totalUser++;
        users.push(parseInt(user.data.id));
    });

    var hideEntry = false;
    $.each(users, function(i, us){
        if(us == uid){
            hideEntry = true;
            return false;
        }
    });

    //Les cases libre
    for(var k = 1; k <= (4-totalUser); k++)
    {
        html += '<li id="" class="room-user">' +
            '<i class="avatar av-noname"></i>' ;
        if(hideEntry == false) {
            html += '<button class="btn btn-xs btn-success room-in" rel="' + roomId + '">Entrer</button>';
        }
        html += '</li>';
    }

    html +=             '</ul>' +
        '<div class="clear"></div>' +
        '</div>' +
        '</li>';

    return html;
}

function updateRoomHtml(roomId, room)
{
    var html = '<ul class="room-container">';

    //Les cases avec user
    var totalUser = 0;
    var users = [];
    $.each(room, function(i, user){
        html += '<li id="U' + user.data.id + '" class="room-user">' +
            '<i class="avatar av-f1 col-xs-12"></i>' +
            '<span class="u-name col-xs-12">' + user.data.name + '</span>';
        if(uid == user.data.id) {
            html += '<button class="btn btn-xs btn-danger col-xs-12 room-out" rel="' + roomId + '">Sortir</button>';
        }
        html += '</li>';
        totalUser++;
        users.push(parseInt(user.data.id));
    });

    var hideEntry = false;
    $.each(users, function(i, us){
        if(us == uid){
            hideEntry = true;
            return false;
        }
    });

    //Les cases libre
    for(var k = 1; k <= (4-totalUser); k++)
    {
        html += '<li id="" class="room-user">' +
            '<i class="avatar av-noname"></i>';
        if(hideEntry == false) {
            html += '<button class="btn btn-xs btn-success room-in" rel="' + roomId + '">Entrer</button>';
        }
        html += '</li>';
    }

    html += '<div class="clear"></div>' +'</ul>';
    return html;
}

function attemptToStart(roomId)
{
    $('#' + roomId).append('<span class="attempt count_down">Game strating in <i>10</i> seconds ...</span>')
    countDown = true;
    startCountdown(roomId);
}

var startCountdown = function(roomId)
{
    if(countDown == true) {
        s = countDownDuree;
        m = 0;
        h = 0;
        if (s < 0) {
            //start game event
            stopCountdown();
            websocket.send( JSON.stringify({type: "room/goToGame", roomId: roomId}));
            console.log('game start');

        } else {
            if (s > 59) {
                m = Math.floor(s / 60);
                s = s - m * 60
            }
            if (m > 59) {
                h = Math.floor(m / 60);
                m = m - h * 60
            }
            if (s < 10) {
                s = "0" + s
            }
            if (m < 10) {
                m = "0" + m
            }
            $('.count_down i').html(s);
        }
        countDownDuree = countDownDuree - 1;
        window.setTimeout("startCountdown('"+roomId+"');",1000);
    }else{
        $('.count_down').remove();
    }
}

function stopCountdown()
{
    if(countDown == true) {
        countDownDuree = baseCountDown;
        countDown = false;
        console.log('countdown stopped');
    }
}
