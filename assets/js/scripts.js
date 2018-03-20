// Firebase Configuration 
var config = {
    apiKey: "AIzaSyA5UbGQUHx7BVqzN4ZBa4JBp-mS1qVgCK4",
    authDomain: "rps-homework-3cbb3.firebaseapp.com",
    databaseURL: "https://rps-homework-3cbb3.firebaseio.com",
    projectId: "rps-homework-3cbb3",
    storageBucket: "rps-homework-3cbb3.appspot.com",
    messagingSenderId: "15473505280"
  };
  firebase.initializeApp(config);


// ------------------------------------------------------------
  var rpsDatabase = firebase.database();
// ------------------------------------------------------------

var playerType = {
    "rock":0,
    "paper" : 1,
    "scissors" : 2
};

var ActivePlayer = 1; // Active Player defaults to 1
var player1;
var player2;
var thisPlayer;
var activePlayer;

$(document).ready(function(){

    $('#playerButton').on("click", function(e){
        
        e.preventDefault();
        var newPlayer = $('#playerName').val().trim();
        var newPlayerObj = {
            "name": newPlayer,
            "numWins": 0,
            "numLosses" : 0,
            "selection" : "",
            "playerId" : 0
        }
        //Are there active players?
        findPlayer(newPlayerObj);
        
        $('#PlayerInputForm').css("visibility", 'hidden');
        $('#playerid').css("visibility","visible");
        thisPlayer = newPlayerObj;
        
        
    }); 

    $("#rockCharacter, #paperCharacter, #scissorsCharacter").on("click", function(e){
        e.preventDefault();
        var $thebackgroundImage = 'url("./assets/image/' + $(this).attr("data-img") + '")';
        

        if(player1.name != null && player2.name!= null && player1.name === thisPlayer.name && activePlayer === 1){
            console.log("What");
            $('#player1').addClass("playerDisplay"); 
            $('#player1').attr("data-char", $(this).attr("data-char"));
            $('#player1').css('background-image', $thebackgroundImage); 
            player1.selection = $(this).attr("data-char");
            rpsDatabase.ref('/players/').child("/player1/selection").set(player1.selection);
            activePlayer = 2;
            rpsDatabase.ref().child('activePlayer').set(2);
             

            //Need to update users choice

        }
       
        if(player1.name != null && player2.name!= null && player2.name === thisPlayer.name && activePlayer === 2){
            console.log("in this block");
            $('#player2').addClass("playerDisplay"); 
            $('#player2').attr("data-char", $(this).attr("data-char"));
            $('#player2').css('background-image', $thebackgroundImage); 
            $('#player2').text('');
            $('#player2').prop('opacity', 1);  
            player2.selection = $(this).attr("data-char");
            rpsDatabase.ref('/players/').child("/player2/selection").set(player2.selection);

            rockPaperScissors();

            activePlayer = 1;
            rpsDatabase.ref().child('activePlayer').set(1);

            
        }
        
        


    })

   $('#battleButton').on("click", function(e){
    e.preventDefault();
    $(this).attr("disabled",true);
       
       $('#player1' ).effect("shake", {"times":"3", direction:"up"});
       $('#player2' ).effect("shake", {"times":"3", direction:"down"});

       var player1Value = $('#player1' ).attr('data-char');
       var player2Value = $('#player2' ).attr('data-char');

       console.log(player1Value, ',', player2Value);
       var player1Won = thisPlayerWon(player1Value, player2Value);
       var player2Won = thisPlayerWon(player2Value, player1Value);

       // determine winner
       if(player1Value === player2Value){
           //Tie value ... no winner
           console.log("tie");
           //create a h4
           var $heading = $('<h4>');
           $heading.text('Tie! No Winner');
           var $heading2 = $('<h4>');
           $heading2.text('Tie! No Winner');
           
           //No attach to the players
           $('#player1').append($heading);
           $('#player2').append($heading2);
          
       }else if(player1Won){
           
           var $heading = $('<h4>');
           $heading.text('Winner!');
           $('#player1').append($heading);
           $('#player2').css('background-image','none');
           $('#player2').removeClass('playerDisplay'); 
           $('#player2').addClass('playerLoses');

       }else if(player2Won){
        var $heading = $('<h4>');
        $heading.text('Winner!');
        $('#player2').append($heading);
        $('#player1').css('background-image','none');
        $('#player1').removeClass('playerDisplay'); 
        $('#player1').addClass('playerLoses');
       }
       
       

       //Play again?
       $('#playAgainButton').css("visibility","visible");
       $('#playAgainButton').attr("disabled",false);
       $(this).css("visibility","hidden");
       $(this).css("disabled",true);

   });

   $('#playAgainButton').on("click", function(e){
        
       $('#playerSection').empty();
       var player1Div = $('<div>');
       player1Div.attr("id","player1");
       player2Div=$('<div>');
       player2Div.attr("id","player2");
       $('#playerSection').append(player1Div).append(player2Div);
       $('#battleButton').css('visibility','visible');
       $('#battleButton').attr('disabled',true);
       $(this).attr("disabled", true);
       $(this).css("visibility",'hidden')


   });




});


function thisPlayerWon(playerValue, otherPlayerValue){

    if(playerValue == playerType.rock && otherPlayerValue == playerType.scissors){
        //Rock wins if scissors is the opponent
        return true;

    }else if(playerValue == playerType.paper  && otherPlayerValue == playerType.rock){
        //Paper wins if Opponent is rock
        return true
    }else if(playerValue == playerType.scissors  && otherPlayerValue == playerType.paper){
        //Scissors win if paper opponennt
        return true;
    }else{
        return false;
    }

}

function findPlayer(playerObject){

     
    rpsDatabase.ref('/players/').on("value", function(snapshot){

        
        if(snapshot.child('player1').exists()){
            console.log("found Player 1")
            //Check if player 2 is nulll
            if(snapshot.child('player2').exists()){
                // There is already a game in progress
                console.log("found player 2");

            }else{
                
                console.log(playerObject.playerId);
                
                if(playerObject.playerId !=  1){
                    console.log("Add player 2");  
                    playerObject.playerId = 2;
                    rpsDatabase.ref('/players/').child("/player2").set(playerObject); 
                   rpsDatabase.ref('/players/player2').onDisconnect().remove();
                var stringPlayer = `Welcome ${playerObject.name}!  You are player 2`;
                console.log(stringPlayer);
                $('#playerId').text(stringPlayer);
                $('#playerInputForm').css("visibility", 'hidden');
                //Set active player back to 1 to begin listening
                player2 = playerObject;
                
                }
                 
            
            }
        }else{
            //player1 not found, add to database
            playerObject.playerId = 1;
            rpsDatabase.ref('/players/').child("/player1").set(playerObject);  
            //Set the active player to player 1
            rpsDatabase.ref().child("activePlayer").set(1);
            //If player disconnects, remove note
            rpsDatabase.ref('/players/player1').onDisconnect().remove();
            //Identify the player
            var stringPlayer = `Welcome ${playerObject.name}!  You are player 1`;
            console.log(stringPlayer);
            $('#playerId').text(stringPlayer);
            player1 = playerObject;
            rpsDatabase.ref().child('activePlayer').set(1);

        }
    });
}


// This is where I am confused, need to listen for changes
rpsDatabase.ref("/players/").on("value", function(snapshot) {
	// If player exists in database
	if (snapshot.child("player1").exists()) {
		 

		// Record  set player 1 equal to database values
		player1 = snapshot.val().player1;
		 

		// Update the stat seciton
		//$("#playerOneName").text(player1Name);
		//$("#player1Stats").html("Win: " + player1.win + ", Loss: " + player1.loss + ", Tie: " + player1.tie);
	} else {
		//Player 1 is missing or disconnected

		player1 = null;
		

		// Update player1 display
		
        rpsDatabase.ref("/outcome/").remove();
        
		
	}

	// Does player 2 exists
	if (snapshot.child("player2").exists()) {
		 

		// Record player2 data
		player2 = snapshot.val().player2;
		 

		// Update player2 display
		 
	} else {
		console.log("Player 2 does NOT exist");

		player2 = null;
		 

		// Update player2 display
		 
        rpsDatabase.ref("/outcome/").remove();
         
		 
	}

	// Both Players Present, default to player 1
	if (player1 && player2) {
        
		//rpsDatabase.ref().child('activePlayer').set(1);
	}

	 
});
 


// Attach a listener to the database /turn/ node to listen for any changes
rpsDatabase.ref("/activePlayer/").on("value", function(snapshot) {
    // Check if it's player1's turn



     console.log("The Snapshot value is " + snapshot.val());
	if (snapshot.val() === 1) {
		//Set the active player to player 1
		// Both players have chosen names, waiting for selection from player 1
         activePlayer = 1;
          
              
         
        }else if (snapshot.val() === 2) {
             activePlayer = 2;
             console.log("the snapshot value is " + snapshot.val());
              activePlayer= 2; 
              
        }
	

        
        
        
         
		// Update the display if both players are in the game
		if (player1 && player2) {
	            
            
                var $message = $('<p>');
                $message.text("Waiting on player 2 to make selection");
                $('#player2').append($message);
                $('#player2').append($message);
                $('#player2').css('background-color','black');
                $('#player2').css('opacity',0.4);

            
             
            
		 
	}
});


function rockPaperScissors(){

    $('#player1' ).effect("shake", {"times":"3", direction:"up"});
    $('#player2' ).effect("shake", {"times":"3", direction:"down"});

    //var player1Value = $('#player1' ).attr('data-char');
   // var player2Value = $('#player2' ).attr('data-char');

    //console.log(player1Value, ',', player2Value);
    var player1Won = thisPlayerWon(player1.selection, player2.selection);
    var player2Won = thisPlayerWon(player2.selection, player1.selection);

    // determine winner
    if(player1.selection === player2.selection){
        //Tie value ... no winner
        console.log("tie");
        //create a h4
        var $heading = $('<p>');
        $heading.text('Tie! No Winner');
        var $heading2 = $('<p>');
        $heading2.text('Tie! No Winner');
        
        //No attach to the players
        $('#player1').append($heading);
        $('#player2').append($heading2);
       
    }else if(player1Won){
        
        var $heading = $('<h4>');
        $heading.text('Winner!');
        $('#player1').empty();
        $('#player1').append($heading);
        $('#player2').css('background-image','none');
        $('#player2').removeClass('playerDisplay'); 
        $('#player2').addClass('playerLoses');
         
        rpsDatabase.ref().child("/result/").set(Object.keys(playerType)[player1.selection].toUpperCase() + " wins!");
		rpsDatabase.ref().child("/players/player1/numWins").set(player1.numWins + 1);
		rpsDatabase.ref().child("/players/player2/numLosses").set(player2.numLosses + 1);

    }else if(player2Won){
     var $heading = $('<h4>');
     $heading.text('Winner!');
     $('#player2').empty();
     $('#player2').append($heading);
     $('#player1').css('background-image','none');
     $('#player1').removeClass('playerDisplay'); 
     $('#player1').addClass('playerLoses');

      
     rpsDatabase.ref().child("/result/").set(Object.keys(playerType)[player2.selection].toUpperCase() + " wins!");
	 rpsDatabase.ref().child("/players/player1/numWins").set(player2.numWins + 1);
	 rpsDatabase.ref().child("/players/player2/numLosses").set(player1.numLosses + 1);
    }
    
    //Restore settings for player 1 
    activePlayer = 1;
	rpsDatabase.ref().child("/activePlayer").set(1);

     

}


// Need to listen so can be updated
rpsDatabase.ref("/result/").on("value", function(snapshot) {

    lastResult = snapshot.val();
	
});
