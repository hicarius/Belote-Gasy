(function(){

    var Graphics = createjs.Graphics;
    var Shape = createjs.Shape;

    /**
     * Constructeur
     */
    EaselJsUtils = function(stage) {
        this.stage = stage;
    };

    /**
     * Classe EaselJsUtils
     */
    EaselJsUtils.prototype = {

        /**
         * Créer et afficher un média
         * @param String src : source du média
         * @param Number x : position x
         * @param Number y : position y
         * @param Object options : options
         * - Array scale : échelle
         * @returns {Bitmap}
         */
        createBitmap: function(src, options, name) {
            // Définir la source et la position du média
            var bitmap = new createjs.Bitmap(src);
            bitmap.x = options.x;
            bitmap.y = options.y;
            // Appliquer les options
            if (options) {
                // Mise à l'échelle
                if (options.scale) {
                    bitmap.scaleX = options.scale[0];
                    bitmap.scaleY = options.scale[1];
                }
                // Rotation
                if (options.rotation) {
                    bitmap.rotation = options.rotation;
                }
            }

            if(name != ''){
                bitmap.name = name;
                bitmap.cursor = 'pointer';
            }
            // Ajouter le Bitmap au Stage et le retourner
            this.stage.addChild(bitmap);
            return bitmap;
        },

        /**
         * Créer une image "Bloc d'herbe"
         * @param Number x : position x
         * @param Number y : position y
         * @param Object options : options
         * - Array scale : échelle
         * @returns {Bitmap}
         */
        createCard: function(cardImg, options, name) {
            return this.createBitmap(cardImg, options, name);
        },

        placeDecks: function(backDecksImg, options){
            return this.createBitmap(backDecksImg, options)
        },

        placeCard: function(cardImg, options){
            return this.createBitmap(cardImg, options)
        },

        moveCard: function(cardName, toX, toY){

        },

        /**
         * Afficher du texte
         * @param String text : le texte à afficher
         * @param String font : police d'écriture et style
         * @param Number x : position x
         * @param Number y : position y
         * @param Object options : options
         * - String color : couleur du texte
         * - String textAlign : alignement du texte
         * - String cursor : type de pointeur souris
         * @returns {Text}
         */
        createText: function(text, font, x, y, options) {
            // Définir le texte, la police et la position
            var txt = new createjs.Text();
            txt.font = font;
            txt.text = text;
            txt.x = x;
            txt.y = y;
            // Appliquer les options
            if (options) {
                if (options.color) {
                    txt.color = options.color;
                }
                if (options.textAlign) {
                    txt.textAlign = options.textAlign;
                }
                if (options.cursor) {
                    txt.cursor = options.cursor;
                }
            }
            // Ajouter le Text au Stage et le retourner
            this.stage.addChild(txt);
            return txt;
        },

        /**
         * Dessiner un rectangle avec coins arrondis
         * @param Number x : position x de la forme
         * @param Number y : position y de la forme
         * @param Number w : largeur de la forme
         * @param Number h : hauteur de la forme
         * @param Array rgb : couleur de la forme
         * @param Object options : options
         * - Number opactiy : opacité de la forme
         * - Number radius : rayon des angles de la forme
         * @returns {Shape}
         */
        createRoundRect: function(x, y, w, h, rgb, options) {
            // Créer la forme
            var graphic = new Graphics();
            var opacity = 1;
            var radius = 90;
            if (options) {
                if (options.opacity) {
                    opacity = options.opacity;
                }
                if (options.radius) {
                    radius = options.radius;
                }
            }
            graphic.beginFill(Graphics.getRGB(rgb[0], rgb[1], rgb[2], opacity));
            graphic.drawRoundRect(x,  y,  w,  h,  radius);
            // Ajouter la forme au stage
            var shape = new Shape(graphic);
            this.stage.addChild(shape);
            return shape;
        },

        /**
         * Dessiner un cerle
         * @param Number x : position x de la forme
         * @param Number y : position y de la forme
         * @param Number radius : rayon du cercle
         * @param Array rgb : couleur de la forme
         * @param Object options : options
         * - Number opacity : opacité de la forme
         * @returns {Shape}
         */
        createCircle: function(x, y, radius, rgb, options) {
            // Créer la forme
            var graphic = new Graphics();
            var opacity = 1;
            if (options) {
                if (options.opacity) {
                    opacity = options.opacity;
                }
            }
            graphic.beginFill(Graphics.getRGB(rgb[0], rgb[1], rgb[2], opacity));
            graphic.drawCircle(x, y, radius);
            // Ajouter la forme au stage
            var shape = new Shape(graphic);
            this.stage.addChild(shape);
            return shape;
        },

        /**
         * Shuffle an array
         * @param array
         * @returns {*}
         */
        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }

    };

}());