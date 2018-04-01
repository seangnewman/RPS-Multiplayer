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
// Reference to the database object
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
var player1Name = "";
var player2Name = "";
var lastResult;


// Wait until DOM has loaded
$(document).ready(function(){

  $('#playerButton').on("click", function(e){
    e.preventDefault();
    // Retrieve name of player
    var newPlayer = $('#playerName').val().trim();
    //Create the player object, assigining the name to the object
    var newPlayerObj = {
      "name": newPlayer,
      "numWins": 0,
      "numLosses" : 0,
      "numTies" : 0,
      "selection" : "",
      "playerId" : 1
    }
    //Assign the object to player1 or player 2   
    findPlayer(newPlayerObj);
    //Hide the name input button
    $('#PlayerInputForm').css("visibility", 'hidden');
    //Display the welcome banner
    $('#playerid').css("visibility","visible");
    // Current player object
    thisPlayer = newPlayerObj;
  }); 

  $("#rockCharacter, #paperCharacter, #scissorsCharacter").on("click", function(e){
    e.preventDefault();
    var activePlayerObj;
    var player1Selection = $('#player1').attr("data-char");
    var player2Selection = $("#player2").attr("data-char");

    if(activePlayer === 1){
      activePlayerObj = player1;
    }else{
      activePlayerObj = player2;
    }
    var $thebackgroundImage = 'url("./assets/image/' + $(this).attr("data-img") + '")';
    // set the turn value = active player        
    if( activePlayer === 1 && player1.name === activePlayerObj.name){
      $('#player1').addClass("playerDisplay"); 
      $('#player1').attr("data-char", $(this).attr("data-char"));
      $('#player1').css('background-image', $thebackgroundImage); 
      player1.selection = $(this).attr("data-char");
      rpsDatabase.ref('/players/').child("/player1/selection").set($(this).attr("data-char"));
      setActiveUser(activePlayer);
      //rpsDatabase.ref().child("/activePlayer").remove();
      rpsDatabase.ref().child("/activePlayer").set(2);
    }
    if( activePlayer === 2 && player2.name === activePlayerObj.name){
      $('#player2').addClass("playerDisplay"); 
      $('#player2').attr("data-char", $(this).attr("data-char"));
      $('#player2').css('background-image', $thebackgroundImage); 
      $('#player2').text('');
      $('#player2').prop('opacity', 1);  
      player2.selection = $(this).attr("data-char");
      rpsDatabase.ref('/players/').child("/player2/selection").set($(this).attr("data-char"));
      rockPaperScissors(player1.selection, player2.selection );
      setActiveUser(activePlayer);
    }
  });
});  // End of click events and document

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
    player1 = snapshot.val().player1;
    player1Name = player1.name;
    //Update player1 dispay
    $("#playerOneName").text(player1Name);
    $("#player1Stats").html("Win : " + player1.numWins + ", loss : " + player1.numLosses + ", Tie " + player1.numTies);
    if(snapshot.child('player2').exists()){
      // There is already a game in progress
      player2 = snapshot.val().player2;
      player2Name = player2.name;
    }else{
      // double check this isn't the same player
      playerObject.playerId = 2; 
      playerObject.name = $('#playerName').val().trim();
      player1Object = snapshot.val().player1;
      if(playerObject.playerId != 1 && playerObject.name != player1Object.name ){ 
        // Add player2
        updatePlayer2Display();
        player2 = addPlayer(playerObject);
        initializeChat(player2);
      }
    }
  }else{
    player1 = null;
    updatePlayer1Display();
    //Ok, so no player 1... is player 2 available
    if(snapshot.child('player2').exists()){
      // There is already a game in progress
      player2 = snapshot.val().player2;
      player2Name = player2.name;
    }else{
      // double check this isn't the same player
      if(playerObject.name != $('#playerName').val().trim()){
        // Add player2
        updatePlayer2Display();
        //player2Object.playerId = 1;
        player2 = addPlayer(playerObject);
        initializeChat(player2); 
      }
    }
    //player1 not found, add to database
    playerObject.playerId = 1;
    rpsDatabase.ref().child("/activePlayer").set(1);
    playerObject.name = $('#playerName').val().trim();
    player1 = addPlayer(playerObject);
    initializeChat(player1);
  }

});
} // end find player
function updatePlayer1Display(){
  $("#playerOneName").text("Waiting for Player 1...");
  $("#playerPanel1").removeClass("playerPanelTurn");
  $("#playerPanel2").removeClass("playerPanelTurn");
  rpsDatabase.ref("/outcome/").remove();
  $("#roundOutcome").html("Rock-Paper-Scissors");
  $("#waitingNotice").html("");
  $("#player1Stats").html("Win: 0, Loss: 0, Tie: 0");
}

function updatePlayer2Display(){
  $("#playerPanel2").removeClass("playerPanelTurn");
  $("#playerPanel1").removeClass("playerPanelTurn");
  rpsDatabase.ref("/outcome/").remove();
  $("#roundOutcome").html("Rock-Paper-Scissors");
  $("#waitingNotice").html("");
  $("#player2Stats").html("Win: 0, Loss: 0, Tie: 0");
}

function addPlayer(playerObject){
  // We need to capture playerid
  var theId = playerObject.playerId;
  var playerRef = '/players/player' + theId;
  rpsDatabase.ref('/players/').child("/player" + theId).set(playerObject);  
  //Set the active player to player 2
  rpsDatabase.ref().child("/activePlayer").set(theId);
  //If player disconnects, remove note
  //rpsDatabase.ref('/players/player' + playerObject.playerId).onDisconnect().remove();
  rpsDatabase.ref(playerRef).onDisconnect().remove();
  rpsDatabase.ref("/result").onDisconnect().remove();
  rpsDatabase.ref("/activePlayer").onDisconnect().remove();
  rpsDatabase.ref("/outcome").onDisconnect().remove();
  //Identify the player
  var stringPlayer = `Welcome ${playerObject.name}!  You are player ` + theId;
  $('#playerId').text(stringPlayer);
  //player1 = playerObject;
  setActiveUser(theId); 
  return playerObject;
}

// This is where I am confused, need to listen for changes
rpsDatabase.ref("/players/").on("value", function(snapshot) {
  // If player exists in database
  if (snapshot.child("player1").exists()) {
  // Set the game object for player 1 equal to object in fb
  player1 = snapshot.val().player1;
  //Set value of player1Name = name from database
  player1Name = player1.name;
  //Update Statitistics for player 1
  $("#playerOneName").text(player1Name);
  $("#player1Stats").html("Win : " + player1.numWins + " Loss : " + player1.numLosses + " Tie " + player1.numTies);
  } else /* Player1 does not exist*/{
    //Set the player1 object to null  
    player1 = null;
    //player1 name value is empty
    player1Name = "";
    // Update player1 display
	$("#playerOneName").text("Waiting for Player 1...");
	$("#playerPanel1").removeClass("playerPanelTurn");
    $("#playerPanel2").removeClass("playerPanelTurn");
    //Remove result of game from fb
	rpsDatabase.ref("/outcome/").remove();
	$("#roundOutcome").html("Rock-Paper-Scissors");
	$("#waitingNotice").html("");
    $("#player1Stats").html("Win: 0, Loss: 0, Tie: 0");
  }

  // Test for existence of player 2
  if (snapshot.child("player2").exists()) {
    // Set the player2 object equal to the fb value for player 2
    player2 = snapshot.val().player2;
    // Set the player2 object equal to the fb value for player 2
	player2Name = player2.name;
    // Update player2 display
	$("#playerTwoName").text(player2Name);
    $("#player2Stats").html("Win: " + player2.numWins + ", Loss: " + player2.numLosses + ", Tie: " + player2.numTies);
  } else /* Player 2 does not exist */ {
	// Set the player 2 object to null
    player2 = null;
    //player 2 name value is empty
	player2Name = "";
	// Update player2 display
	//$("#playerTwoName").text("Waiting for Player 2...");
	$("#playerPanel1").removeClass("playerPanelTurn");
    $("#playerPanel2").removeClass("playerPanelTurn");
    //Remove result of last game from fb
	rpsDatabase.ref("/outcome/").remove();
	$("#roundOutcome").html("Rock-Paper-Scissors");
	$("#waitingNotice").html("");
    $("#player2Stats").html("Win: 0, Loss: 0, Tie: 0");
  }
  // Both Players Present, Ready for player 1
	if (player1 && player2) {
        // Set the active player t 1
        setActiveUser(activePlayer);
        rpsDatabase.ref().child("/activePlayer").set(turn); 
        $("#waitingNotice").html("Waiting on " + player1Name + " to choose...");
        // I think I should enable chat here
       
	}
// Adding chat functionality... if both players have disconnected empty chat
// I may do this if any player leaves game
    if (player1 === null && player2 === null) {
    // Set the active player t 1
      rpsDatabase.ref("/chat").remove();
      rpsDatabase.ref("/activePlayer").remove();
      rpsDatabase.ref("/result").remove();
      rpsDatabase.ref("/outcome").remove();
      $('#chatText').text("");
      $('#waitingNotice').text("");
      $('#roundOutcome').text("");
    }
});
 
// Attach a listener to the database /turn/ node to listen for any changes
rpsDatabase.ref("/activePlayer").on("value", function(snapshot) {
// Check if it's player1's turn
  if (snapshot.val() === 1) {
    // Update the display if both players are in the game
    if (player1 && player2) {
      $("#playerPanel1").addClass("playerPanelTurn");
      $("#playerPanel2").removeClass("playerPanelTurn");
      $("#waitingNotice").html("Waiting on " + player1Name + " to choose...");
    }
  } else if (snapshot.val() === 2) {
  activePlayer = 2;
  turn = 2;
  // Update the display if both players are in the game
  if (player1 && player2) {
    $("#playerPanel1").removeClass("playerPanelTurn");
    $("#playerPanel2").addClass("playerPanelTurn");
    $("#waitingNotice").html("Waiting on " + player2Name + " to choose...");
  }
 }
});
 
// Need to listen so can be updated
rpsDatabase.ref("/result/").on("value", function(snapshot) {
    lastResult = snapshot.val();
});

rpsDatabase.ref("/outcome").on("value", function(snapshot) {
    lastResult = snapshot.val();
    if(lastResult === 1){
        $('#player1Outcome').text("Winner!");
        $('#player2Outcome').text("");
    }else if(lastResult === 2){
        $('#player2Outcome').text("Winner!");
        $('#player1Outcome').text("");
    }else if(lastResult === 0){
        $('#player1').css('background-image','none');
        $('#player2').css('background-image','none');
        $('#player1').css('background','transparent');
        $('#player2').css('background','transparent');
        $('#player1Outcome').text("");
        $('#player2Outcome').text("");
    }else {
        $('#player1Outcome').text("");
        $('#player2Outcome').text("");
    }
    $('#player1' ).effect("shake", {"times":"3", direction:"up"});
    $('#player2' ).effect("shake", {"times":"3", direction:"down"});
});

// Attach a listener to the database /outcome/ node to be notified of the game outcome
rpsDatabase.ref("/activePlayer").on("value", function(snapshot) {
    activePlayer = snapshot.val();
    turn = snapshot.val();
});

// Attach a listener to the database /outcome/ node to be notified of the game outcome
rpsDatabase.ref("/result").on("value", function(snapshot) {
  lastResult = snapshot.val();
  $("#roundOutcome").text(lastResult);
});

// Attach a listener to the database /outcome/ node to be notified of the game outcome
rpsDatabase.ref("/result/").on("value", function(snapshot) {
  $("#roundOutcome").html(snapshot.val());
});

// Attach a listener to the database player selection,  if both have values then shake 
rpsDatabase.ref("/players/player2/selection").on("value", function(snapshot) {
    // evaluate if both player1 and player2 have selecton values
    if(snapshot.val() === 0 || snapshot.val() === 1 || snapshot.val() === 3){
        $('#player1' ).effect("shake", {"times":"3", direction:"up"});
        $('#player2' ).effect("shake", {"times":"3", direction:"down"});
    }
});
    

// Attach a listener to the database player selection,  if both have values then shake 
rpsDatabase.ref("/players/player2").on("value", function(snapshot) {
   player2 = snapshot.val();
});

// Attach a listener to the database player selection,  if both have values then shake 
rpsDatabase.ref("/players/player1").on("value", function(snapshot) {
  player1 = snapshot.val();
});

// Listen for chat messages
rpsDatabase.ref("/chat/").on("child_added", function(snapshot) {
	var chatMessage = snapshot.val();
	var putChatMessage = $("<div>").html(chatMessage);

	// Change the color of the chat message depending on user or connect/disconnect event
	if (chatMessage.includes("disconnected")) {
		putChatMessage.css("color","red");
	} else if (chatMessage.includes("joined")) {
		putChatMessage.css("background-color", "grey")
	} else if (chatMessage.startsWith(thisPlayer.name)) {
        putChatMessage.css("background-color", "black");
        putChatMessage.css("color", "white");
	} else {
		putChatMessage.css("color", "black");
	}
	$("#chatText").prepend(putChatMessage);
});

// Listen for the chat message
$("#chatButton").on("click", function(event) {
  event.preventDefault();
  if(!thisPlayer){
    return;
  }
  // First, make sure that the player exists and the message box is non-empty
  if ( (thisPlayer.name !== "") && ($("#chatArea").val().trim() !== "") ) {
  // Grab the message from the input box and subsequently reset the input box
  var msg = thisPlayer.name + ": " + $("#chatArea").val().trim();
  $("#chatArea").val("");
  // Get a key for the new chat entry
  var chatKey = rpsDatabase.ref().child("/chat/").push().key;
  // Save the new chat entry
  rpsDatabase.ref("/chat/" + chatKey).set(msg);
  }
});

// Not recognizing disconnect,  forcing it
rpsDatabase.ref("/players/").on("child_removed", function(snapshot) {
  var chatMessage = snapshot.val().name + " has disconnected!";
  // Get a key for the disconnection chat entry
  var chatKey = rpsDatabase.ref().child("/chat/").push().key;
  // Save the disconnection chat entry
  rpsDatabase.ref("/chat/" + chatKey).set(chatMessage);
});

function setActiveUser(theId){
  if(theId === 1 ){
    rpsDatabase.ref().child("/activePlayer").set(2);
  }else{
    rpsDatabase.ref().child("/activePlayer").set(1);
  }
}

function rockPaperScissors(player1Select, player2Select){
  var player1Won = thisPlayerWon(player1.selection, player2.selection);
  var player2Won = thisPlayerWon(player2.selection, player1.selection);
  // determine winner
  if(player1Select === player2Select){
    //Tie value ... no winner
    //create a h4
    var $heading = $('<p>');
    $heading.text('Tie! No Winner');
    var $heading2 = $('<p>');
    $heading2.text('Tie! No Winner');
    //No attach to the players
    $('#player1').append($heading);
    $('#player2').append($heading2);
    rpsDatabase.ref().child("/result").set("Tie!");
    rpsDatabase.ref().child("/outcome").set("");
	rpsDatabase.ref().child("/players/player1/numTies").set(player1.numTies + 1);
	rpsDatabase.ref().child("/players/player2/numTies").set(player2.numTies + 1);
    }else if(player1Won === true){
      var $heading = $('<h4>');
      //$heading.text('Winner!');
      $('#player1').empty();
      $('#player1').append($heading);
      //$('#player2').css('background-image','none');
      $('#player2').removeClass('playerDisplay'); 
      $('#player2').addClass('playerLoses');
      rpsDatabase.ref().child("/result/").set(Object.keys(playerType)[player1.selection].toUpperCase() + " wins!");
      rpsDatabase.ref().child("/outcome").set(1);
      rpsDatabase.ref().child("/players/player1/numWins").set(player1.numWins + 1);
	  rpsDatabase.ref().child("/players/player2/numLosses").set(player2.numLosses + 1);
    }else if(player2Won === true){
      var $heading = $('<h4>');
      //$heading.text('Winner!');
      $('#player2').empty();
      $('#player2').append($heading);
       //$('#player1').css('background-image','none');
      $('#player1').removeClass('playerDisplay'); 
      $('#player1').addClass('playerLoses');
     rpsDatabase.ref().child("/result/").set(Object.keys(playerType)[player2.selection].toUpperCase() + " wins!");
     rpsDatabase.ref().child("/outcome").set(2);
	 rpsDatabase.ref().child("/players/player2/numWins").set(++player2.numWins);
	 rpsDatabase.ref().child("/players/player1/numLosses").set(++player1.numLosses);
    }
    //Restore settings for player 1 
    activePlayer = 1;
    rpsDatabase.ref().child("/activePlayer").set(1);
    //After 5 secons, reset 
    setTimeout(function(){
      //Clear background images
      //$('#player1').css('background-image','none');
      //$('#player2').css('background-image','none');
      //remove outcome, result
      rpsDatabase.ref().child("/outcome").set(0);
      rpsDatabase.ref().child("/result").remove();
      //set active player to primary
      rpsDatabase.ref().child("/activePlayer").set(1);
    },5000);
}

function initializeChat(thisPlayer){
  if(thisPlayer.name.length > 0){
  //Add the new player to the chat
  var chatMessage = thisPlayer.name + ' has joined the battle!';
  //New... get a key for the join
  var chatKey = rpsDatabase.ref().child("/chat").push().key;
  // Save the join entry message
  rpsDatabase.ref("/chat/" + chatKey).set(chatMessage);
  //Clear the name input, annoying me
  $("#playerName").val("");
  }
}