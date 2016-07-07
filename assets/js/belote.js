$(function(){
    $('body').on('click', '.create-room', function(){
        $.ajax({
            method: 'post',
            url: '/create-room',
            success: function(response){
                var html = response.split("|");
                $('.create-room').hide();
                websocket.send( JSON.stringify({type: "room/create", roomId: html[0]}));
            }
        });
    });
    $('body').on('click', '.room-out', function(){
        websocket.send( JSON.stringify({type: "room/userleave", roomId: $(this).attr('rel')}));
        $('.create-room').show();
    });
    $('body').on('click', '.room-in', function(){
        websocket.send( JSON.stringify({type: "room/userjoin", roomId:$(this).attr('rel')}));
        $('.create-room').hide();
    });
});

function debug(debug)
{
    $('#console').append(debug + '<br />');
}

function createRoomHtml(roomId, room)
{
    var html = '<li>' +
        '<div class="well well-sm" id="' + roomId + '">' +
        '<ul class="room-container">';

    //Les cases avec user
    var totalUser = 0;
    $.each(room, function(i, user){
        html += '<li id="U' + user.data.id + '" class="room-user">' +
                    '<i class="avatar av-f1 col-xs-12"></i>' +
                    '<span class="u-name col-xs-12">' + user.data.name + '</span>' +
                    '<button class="btn btn-xs btn-danger col-xs-12 room-out" rel="'+roomId+'">Sortir</button>' +
                '</li>';
        totalUser++;
    });

    //Les cases libre
    for(var k = 1; k <= (4-totalUser); k++)
    {
        html += '<li id="" class="room-user">' +
            '<i class="avatar av-noname"></i>' +
            '<button class="btn btn-xs btn-success room-in" rel="'+roomId+'">Entrer</button>' +
        '</li>';
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
    $.each(room, function(i, user){
        html += '<li id="U' + user.data.id + '" class="room-user">' +
            '<i class="avatar av-f1 col-xs-12"></i>' +
            '<span class="u-name col-xs-12">' + user.data.name + '</span>' +
            '<button class="btn btn-xs btn-danger col-xs-12 room-out" rel="'+roomId+'">Sortir</button>' +
            '</li>';
        totalUser++;
    });

    //Les cases libre
    for(var k = 1; k <= (4-totalUser); k++)
    {
        html += '<li id="" class="room-user">' +
            '<i class="avatar av-noname"></i>' +
            '<button class="btn btn-xs btn-success room-in" rel="'+roomId+'">Entrer</button>' +
            '</li>';
    }

    html += '<div class="clear"></div>' +'</ul>';
    return html;
}
