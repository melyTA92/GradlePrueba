var game;
var gameOptions = {
    gameWidth: 2950,
    gameHeight: 1334,
    cardSheetWidth: 334,
    cardSheetHeight: 440,
    cardScale: 0.8
}
var gameGlobal = {
    playerScore: 0,
    machineScore: 0,
    turno: 0, 
    partidas: 3,
    ganador: false
}
var cartasJugadas = [];
var cartasLimites = [0,12,13,25,26,38,39,51];

var swipeUp;


window.onload = function() {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    game.state.add("PlayGame", playGame)
    game.state.start("PlayGame");
}
var playGame = function(game) {}
playGame.prototype = {
    preload: function() {
        game.load.image("background", "mesa2-01.png");
        for(var i = 0; i < 10; i++){
            game.load.spritesheet("cards" + i, "cards" + i + ".png", gameOptions.cardSheetWidth, gameOptions.cardSheetHeight);
        }
        game.load.spritesheet("indicaciones", "indicaciones.png", 500, 184);
        game.load.spritesheet("swipe", "swipe.png", 80, 130);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.load.image("tuPuntaje", "tuPuntaje.png");
        game.load.image("puntajeMaquina", "puntajeMaquina.png");
        game.load.spritesheet("button3", "button3.png", 302, 200);
        game.load.spritesheet("button5", "button5.png", 302, 200);
        this.cartaMaquina = []
        this.cartaJugador = []
        },
        
    create: function() {
        game.add.tileSprite(0, 0, Math.floor(gameOptions.gameWidth/2) *2, Math.floor(gameOptions.gameHeight/2) *2, 'background');
        game.add.sprite(game.width * 101/144, game.height * 5/8, "tuPuntaje");
        game.add.sprite(game.width * 1/7, game.height * 5/8, "puntajeMaquina");

        if (this.check()) {            
            this.finalizar(this);          
        }
        console.log(gameGlobal.turno)

        var button3= game.add.button(game.width * 3/7, game.height * 1/25, 'button3');
        button3.scale.setTo(0.5,0.5);
        button3.inputEnabled= true;

        var button5= game.add.button(game.width * 4/7.5, game.height * 1/25, 'button5');
        button5.scale.setTo(0.5,0.5);
        button5.inputEnabled= true;
    
        
        var mensaje3= game.add.text(game.width * 3/14, game.height /5, 'Usted tiene 3 intentos', { fontSize: '50px', fill: '#000' });
        var mensaje5= game.add.text(game.width * 3/14, game.height /5, 'Usted tiene 5 intentos', { fontSize: '50px', fill: '#000' });
        mensaje3.visible= false;
        mensaje5.visible= false;

        

        this.playerScoreText = game.add.text(game.width * 25/32, game.height * 3/4, '' + gameGlobal.playerScore, { fontSize: '80px', fill: '#000' });
        this.machineScoreText = game.add.text(game.width / 4.5, game.height * 3/4, '' + gameGlobal.machineScore, { fontSize: '80px', fill: '#000' });

        for (var i = 0; i < gameGlobal.turno; i++) {
            cartaTemporal = cartasJugadas[cartasJugadas.length-(2 * (i+1))]
            this.cartaMaquina[i] = game.add.sprite((game.width / 12) + (i * 150),
                game.width / 8, "cards0");
            this.cartaMaquina[i].anchor.set(0.5);
        	this.cartaMaquina[i].scale.set(gameOptions.cardScale);
            this.cartaMaquina[i].loadTexture("cards" + this.getCardTexture(cartaTemporal));
            this.cartaMaquina[i].frame = this.getCardFrame(cartaTemporal);

            cartaTemporal = cartasJugadas[cartasJugadas.length- (1 + (i*2))]
            console.log("Carta del jugador Temporal: "+ cartaTemporal + ", " + cartaTemporal%13)
            this.cartaJugador[i] = game.add.sprite((game.width - (game.width / 12)) - (i * 150),
                game.width / 8, "cards0");
            this.cartaJugador[i].anchor.set(0.5);
        	this.cartaJugador[i].scale.set(gameOptions.cardScale);
            this.cartaJugador[i].loadTexture("cards" + this.getCardTexture(cartaTemporal));
            this.cartaJugador[i].frame = this.getCardFrame(cartaTemporal);
        }

        

        var textoTusNaipes = "TUS NAIPES";
        var style = {font: "40px Arial", fill: "#ffffff", align: "center"};

        var textoNaipesBaraja = "NAIPES DE BARAJA";
        
        game.add.text(game.width * 4/4.5, game.height / 12, textoTusNaipes, style);
        game.add.text(game.width / 50, game.height / 12, textoNaipesBaraja, style);
        

        this.infoGroup = game.add.group();
        this.infoGroup.visible = false;
        this.deck = Phaser.ArrayUtils.numberArray(0, 51);
        
        Phaser.ArrayUtils.shuffle(this.deck);
//Eligiendo cartas que saldran
		this.cardsInGame = [this.makeCard(0), this.makeCard(1)];                
        
        this.nextCardIndex = 2;
        var tween = game.add.tween(this.cardsInGame[0]).to({
            x: game.width / 2
        }, 1000, Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(function(){
            this.infoGroup.visible = true;
        }, this)
        var infoUp = game.add.sprite(game.width / 2, game.height / 4, "indicaciones");
        infoUp.anchor.set(0.5);
        this.infoGroup.add(infoUp);
        var infoDown = game.add.sprite(game.width / 2, game.height * 3 / 4, "indicaciones");
        infoDown.anchor.set(0.5);
        infoDown.frame = 1;
        this.infoGroup.add(infoDown);
        swipeUp = game.add.sprite(game.width / 1.62, game.height / 2 - gameOptions.cardSheetHeight / 4 - 20, "swipe");
        var swipeUpTween = game.add.tween(swipeUp).to({
            y: swipeUp.y - 180
        }, 1000, Phaser.Easing.Linear.None, true, 0, -1);     
        swipeUp.anchor.set(0.5);   
        this.infoGroup.add(swipeUp);
        var swipeDown = game.add.sprite(game.width / 2.6, game.height / 2 + gameOptions.cardSheetHeight / 4 + 20, "swipe");
        swipeDown.angle = -180;
        swipeDown.frame = 1;
        var swipeDownTween = game.add.tween(swipeDown).to({
            y: swipeDown.y + 180
        }, 1000, Phaser.Easing.Linear.None, true, 0, -1);     
        swipeDown.anchor.set(0.5); 
        this.infoGroup.add(swipeDown);
        game.input.onDown.add(this.beginSwipe, this);
        

//Accion boton 3
        button3.events.onInputDown.add(function () { 
			mensaje5.visible= false;
			mensaje3.visible= true;

			gameGlobal.partidas = 3;
        });

//Accion boton 5
        button5.events.onInputDown.add(function () { 
			mensaje5.visible= true;
			mensaje3.visible= false;

			gameGlobal.partidas = 5;
        });
		console.log(cartasJugadas)
		gameGlobal.turno += 1;
        
    },
    makeCard: function(cardIndex) {
        var card = game.add.sprite(gameOptions.cardSheetWidth * gameOptions.cardScale / -2, game.height / 2, "cards0");
        card.anchor.set(0.5);
        card.scale.set(gameOptions.cardScale);
        var carta = this.deck[cardIndex];        
        var comprobador = cardIndex;
    	var ultima = cartasJugadas[cartasJugadas.length-1]

//Validacion de que no salga la misma carta
        while (cartasLimites.indexOf(carta) !== -1 || cartasJugadas.indexOf(carta) !== -1) {
            cardIndex += 2;
            carta = this.deck[cardIndex];
        }
//Cercania entre las cartas
        if (comprobador == 1) {
            cartaM = carta % 13
            ultimaM = ultima % 13
            if (Math.floor(Math.random() * 10) < 7) {
                while (cartaM < ultimaM - 3 || cartaM > ultimaM + 3 || cartaM == ultimaM || cartasJugadas.indexOf(carta) !== -1 || cartasLimites.indexOf(carta) !== -1) {
                    console.log("Cartas no cercanas " + ultimaM + ", " + cartaM)
                    cardIndex += 2;
                    carta = this.deck[cardIndex];
                    cartaM = carta % 13;
                }
            }
            
//Que pierda si ganador = false
/*
            if (gameGlobal.turno == gameGlobal.partidas-1) {
                if (gameGlobal.ganador) {                    
                        console.log("Aqui se comprueba")
                        cartaM = carta % 13
                        ultimaM = ultima % 13
                        while (cartaM <= ultimaM) {
                            console.log("Cartas no cercanas " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }

                }
            }*/    
        }
        
        cartasJugadas.push(carta);
        console.log(cartasJugadas)
        card.loadTexture("cards" + this.getCardTexture(carta));
        card.frame = this.getCardFrame(carta);
        return card;        
    },
    getCardTexture: function(cardValue){
        return Math.floor((cardValue % 13) / 3) + 5 * Math.floor(cardValue / 26);
    },
    getCardFrame: function(cardValue){
        return (cardValue % 13) % 3 + 3 * (Math.floor(cardValue / 13) % 2);
    },
    beginSwipe: function(e) {
        this.infoGroup.visible = false;
        game.input.onDown.remove(this.beginSwipe, this);
        game.input.onUp.add(this.endSwipe, this);
    },
    endSwipe: function(e) {
        game.input.onUp.remove(this.endSwipe, this);
        var swipeTime = e.timeUp - e.timeDown;
        var swipeDistance = Phaser.Point.subtract(e.position, e.positionDown);
        var swipeMagnitude = swipeDistance.getMagnitude();
        var swipeNormal = Phaser.Point.normalize(swipeDistance);
        if(swipeMagnitude > 20 && swipeTime < 1000 && Math.abs(swipeNormal.y) > 0.8) {
            if(swipeNormal.y > 0.8) {
                if (gameGlobal.turno >= gameGlobal.partidas-1) {        //Si esta en el ultimo turno
                    console.log("Entro a menor")
                    var cartaSalvavidas = this.makeWinnerCard(1, false);
                    this.cardsInGame = [this.cardsInGame[0], cartaSalvavidas];              
                }
                console.log("Se llama a handleSwipe(1)")
                this.handleSwipe(1);
            }
            if(swipeNormal.y < -0.8) {
                if (gameGlobal.turno >= gameGlobal.partidas -1) {        //Si esta en el ultimo turno
                    console.log("Entro a mayor")
                    var cartaSalvavidas = this.makeWinnerCard(1, true);
                    this.cardsInGame = [this.cardsInGame[0], cartaSalvavidas];
                }
                console.log("Se llama a handleSwipe(-1)")
                this.handleSwipe(-1);
            }
        } else {
            game.input.onDown.add(this.beginSwipe, this);
        }
    },
    handleSwipe: function(dir) {
    	console.log("Empieza handleSwipe")
        var cardToMove = (this.nextCardIndex + 1) % 2;
        console.log("Carta a mover: "+cardToMove)
        this.cardsInGame[cardToMove].y += dir * gameOptions.cardSheetHeight * gameOptions.cardScale * 1.1;
        var tween = game.add.tween(this.cardsInGame[cardToMove]).to({
            x: game.width / 2
        }, 500, Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(function() {
            var newCard = cartasJugadas[cartasJugadas.length-1];
            var oldCard = cartasJugadas[cartasJugadas.length-2];
            console.log("direccion :" + dir)
            if(((dir == -1) && ((newCard % 13 > oldCard % 13) || ((newCard % 13 == oldCard % 13) && (newCard > oldCard))))
             || ((dir == 1) && ((newCard % 13 < oldCard % 13) || ((newCard % 13 == oldCard % 13) && (newCard < oldCard))))){
//Si acierta el jugador                
                this.addPlayerScore();
				console.log("Jugador gano")
				console.log(" Carta Jugador: " + newCard + " O " + newCard%13 + " Carta Maquina: " + oldCard+ " O " + oldCard%13)
                game.time.events.add(Phaser.Timer.SECOND, this.fadeCards, this);                
            }
            else{
//Si acierta la maquina
                this.addMachineScore();
				console.log("Maquina gano")
				console.log(" Carta Jugador: " + newCard + " O " + newCard%13 + " Carta Maquina: " + oldCard+ " O " + oldCard%13)
                game.time.events.add(Phaser.Timer.SECOND, this.fadeCards, this);
                   
            }
        }, this)
    },
    moveCards: function() {
    	console.log("Empieza moveCards")
        var cardToMove = this.nextCardIndex % 2;
        var moveOutTween = game.add.tween(this.cardsInGame[cardToMove]).to({
            x: game.width + gameOptions.cardSheetWidth * gameOptions.cardScale
        }, 500, Phaser.Easing.Cubic.Out, true);
        cardToMove = (this.nextCardIndex + 1) % 2
        var moveDownTween = game.add.tween(this.cardsInGame[cardToMove]).to({
            y: game.height / 2
        }, 500, Phaser.Easing.Cubic.Out, true);
        moveDownTween.onComplete.add(function() {
            var cardToMove = this.nextCardIndex % 2
            this.cardsInGame[cardToMove].loadTexture("cards" + this.getCardTexture(this.deck[this.nextCardIndex]));
            this.cardsInGame[cardToMove].frame = this.getCardFrame(this.deck[this.nextCardIndex]);
            this.nextCardIndex = (this.nextCardIndex + 1) % 52;
            this.cardsInGame[cardToMove].x = gameOptions.cardSheetWidth * gameOptions.cardScale / -2;
            game.input.onDown.add(this.beginSwipe, this);
            this.infoGroup.visible = true;
        }, this)
    },
    fadeCards: function(){
    	console.log("cardsInGame 0: " + this.cardsInGame[0])
    	console.log("cardsInGame 1: " + this.cardsInGame[1])
    	var tween = game.add.tween(this.cardsInGame[0]).to({
            x: game.width / 12,
            y: game.width / 8
        }, 500, Phaser.Easing.Cubic.Out, true);
        var tween = game.add.tween(this.cardsInGame[1]).to({
            x: game.width - (game.width / 12),
            y: game.width / 8
        }, 500, Phaser.Easing.Cubic.Out, true);
        /*
        for(var i = 0; i < 2; i++){    	
	        
            var fadeTween = game.add.tween(this.cardsInGame[i]).to({
                alpha: 0
            }, 500, Phaser.Easing.Linear.None, true);
            
        }*/
        game.time.events.add(Phaser.Timer.SECOND, function(){
            game.state.start("PlayGame");    
        }, this)  
    },


    addPlayerScore: function() {
        gameGlobal.playerScore += 1;

    },

    addMachineScore: function() {
        gameGlobal.machineScore += 1;
    },

    check: function() {
        if (gameGlobal.turno >= gameGlobal.partidas) {
                return true;
        }
        return false;
    },

    makeWinnerCard: function(cardIndex, choice) {
        var card = game.add.sprite(gameOptions.cardSheetWidth * gameOptions.cardScale / -2, game.height / 2, "cards0");
        card.anchor.set(0.5);
        card.scale.set(gameOptions.cardScale);
        var carta = cartasJugadas[cartasJugadas.length-1];        
        var comprobador = cardIndex;
        var ultima = cartasJugadas[cartasJugadas.length-2]

//Cercania entre las cartas
/*
        if (comprobador == 1) {     //Si se esta sacando la segunda carta
            cartaM = carta % 13
            ultimaM = ultima % 13
            while (cartaM < ultimaM - 3 || cartaM > ultimaM + 3 || cartaM == ultimaM || cartasLimites.indexOf(carta) !== -1 || cartasJugadas.indexOf(carta) !== -1) {
                console.log("Cartas no cercanas " + ultimaM + ", " + cartaM)
                cardIndex += 2;
                carta = this.deck[cardIndex];
                cartaM = carta % 13;
            }
        } else {
//Validacion de que no salga la misma carta
            while (cartasLimites.indexOf(carta) !== -1 || cartasJugadas.indexOf(carta) !== -1) {
                cardIndex += 2;
                carta = this.deck[cardIndex];
            }        
        }*/
//Que pierda si ganador = false
console.log("validacion de ultimo turno")
        if (gameGlobal.turno == gameGlobal.partidas) {    //Si es el ultimo turno
            console.log("Ultimo turno")
            if (comprobador == 1) {                         //Si se esta sacando la segunda carta
                console.log("Ultima carta")
                if (gameGlobal.ganador) {                   //Si es ganador
                    console.log("Es ganador")
                    cartaM = carta % 13
                    ultimaM = ultima % 13
                    if (choice) {                           //Si escogio mayor
                        console.log("Escogio mayor")
                        while (cartaM <= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy pequeña " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    } else {                                //Si escogio menor
                        console.log("Escogio menor")
                        while (cartaM >= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy grande " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    }
                } else {
                    console.log("Es perdedor")
                    cartaM = carta % 13
                    ultimaM = ultima % 13
                    if (choice) {                           //Si escogio mayor
                        console.log("Escogio mayor")
                        while (cartaM >= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy grande " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    } else {                                //Si escogio menor
                        console.log("Escogio menor")                        
                        while (cartaM <= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy pequeña " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    }
                }
            }

            
			console.log("Carta Salvavidas" + carta % 13)
			cartasJugadas[cartasJugadas.length-1] = carta;
			console.log(cartasJugadas)
			card.loadTexture("cards" + this.getCardTexture(carta));
			card.frame = this.getCardFrame(carta);
			return card;  


        }

        //Para penultimo turno 
        console.log("validacion de penultimo turno")

        if (gameGlobal.turno == gameGlobal.partidas - 1) {    //Si es el ultimo turno
            console.log("penultimo turno")
            if (comprobador == 1) {                         //Si se esta sacando la segunda carta
                console.log("Ultima carta")
                cartaM = carta % 13
                ultimaM = ultima % 13
                if(gameGlobal.playerScore== 1){
                    if (choice) {                           //Si escogio mayor
                        console.log("Escogio mayor")
                        while (cartaM >= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy pequeña " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    } else {                                //Si escogio menor
                        console.log("Escogio menor")
                        while (cartaM <= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy grande " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    }
                
                } else {
                    if  (choice) {                           //Si escogio mayor
                        console.log("Escogio mayor")
                        while (cartaM <= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy pequeña " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    } else {                                //Si escogio menor
                        console.log("Escogio menor")
                        while (cartaM >= ultimaM || cartasJugadas.indexOf(carta) !== -1) {
                            console.log("Cartas muy grande " + ultimaM + ", " + cartaM)
                            cardIndex += 2;
                            carta = this.deck[cardIndex];
                            cartaM = carta % 13;
                        }
                    }
                
                }
                
            }

            console.log("Carta Salvavidas" + carta % 13)
            cartasJugadas[cartasJugadas.length-1] = carta;
            console.log(cartasJugadas)
            card.loadTexture("cards" + this.getCardTexture(carta));
            card.frame = this.getCardFrame(carta);
            return card; 
        }
		console.log("ERROR-----------------")
        return 0;     
    },

    finalizar: function(e) {
        //mensaje de final del juego
        var mensaje;
        
        if (gameGlobal.playerScore > gameGlobal.machineScore) {
            mensaje = game.add.text(game.width * 5/14, game.height /3, 'Fin del juego\n Usted Gana', { fontSize: '150px', fill: '#000' });
            game.paused = true;            
        } else {
            mensaje = game.add.text(game.width * 5/14, game.height /3, 'Fin del juego\n Usted Pierde', { fontSize: '150px', fill: '#000' });
            game.paused = true;
        }

        var continuar = game.add.text(game.width * 11/28, game.height * 2/3, "Continuar", { fontSize: '150px', fill: '#000' })
        continuar.inputEnabled = true;
//Si se presiona continuar
        continuar.events.onInputDown.add(function () { 
            gameGlobal = {
                playerScore: 0,
                machineScore: 0,
                turno: 1,
                partidas: gameGlobal.partidas,
                ganador: gameGlobal.ganador
            }
            /*
            e.cartaMaquina = [];
            e.cartaJugador = [];
            */
            for (var i = 0; i < gameGlobal.partidas; i++) {
                e.cartaMaquina[i].destroy();
                e.cartaJugador[i].destroy();
            }

            cartasJugadas = [cartasJugadas[cartasJugadas.length-2], cartasJugadas[cartasJugadas.length-1]];
            
            game.paused = false;
            e.playerScoreText.setText("0");
            e.machineScoreText.setText("0");
            continuar.destroy();
            mensaje.destroy();	
        });
        

    }
}