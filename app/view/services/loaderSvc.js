myServices.service('loaderSvc', function () {
    var manifestArray = [
        {src: "images/spritesheets/playingCards.png", id: "spriteCard"},
        {src: "images/spritesheets/playingCardBacks.png", id: "spriteBackCard"},
        {src: "sound/cardPlace1.ogg", id: "cardPlace"},
        {src: "sound/cardSlide1.ogg", id: "cardSlide"},
    ];

    //load all card
    $.each( ['c', 'd', 'h', 's'], function(i, color){
        $.each([7,8,9,10,'A','J','Q','K'], function(x, number){
            manifestArray.push({src: "images/cards/card_" + color + number + ".png", id: color + number});
        });
    });

    //load all back card
    $.each( ['blue', 'green', 'red'], function(i, color){
        $.each([1,2,3,4,5], function(x, number){
            manifestArray.push({src: "images/cards/cardBack_" + color + number + ".png", id: "bc_" + color + number});
        });
    });

    var manifest = manifestArray,
        loader = new createjs.LoadQueue(true);

    this.getResult = function (asset) {
        return loader.getResult(asset);
    };
    this.getLoader = function () {
        return loader;
    };
    this.loadAssets = function () {
        loader.loadManifest(manifest, true, "/app/assets/");
    };
});