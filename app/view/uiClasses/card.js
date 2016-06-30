uiClasses.factory("Card", [
    'loaderSvc',
    function (loaderSvc) {
        function Card(obj) {
            var name = obj.color + obj.number;
            this.card = new createjs.Bitmap(loaderSvc.getResult(name));
            this.card.name = name;
            this.card.x = obj.x;
            this.card.y = obj.y;

            // Rotation
            if (obj.rotation) {
                this.card.rotation = obj.rotation;
            }
        }

        Card.prototype = {
            addToStage: function (stage) {
                stage.addChild(this.card);
            },
            removeFromStage: function (stage) {
                stage.removeChild(this.card);
            },
            getCard: function()
            {
                return this.card;
            }
        };

        return(Card);
    }]);