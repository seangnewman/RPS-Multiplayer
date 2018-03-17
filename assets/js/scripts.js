var playerType = {
    "rock":0,
    "paper" : 1,
    "scissors" : 2
};

$(document).ready(function(){

    $('#player2Button').attr('disabled', true);
    $('#battleButton').attr('disabled', true);

    $("#rockCharacter, #paperCharacter, #scissorsCharacter").on("click", function(e){
        e.preventDefault();
        var $thebackgroundImage = 'url("./assets/image/' + $(this).attr("data-img") + '")';
        //Test if player 1 is active, 
        if($('#player2Button').attr("disabled") === "disabled"){
            //Set background of Player 1
            $('#player1').addClass("playerDisplay"); 
            $('#player1').css('background-image', $thebackgroundImage); 
            
            //Disable this button
            $('#player1Button').attr('disabled', true);
            //Enable player 2 button
            $('#player2Button').attr('disabled', false);
        }else{
            //set background of Player 2
            $('#player2').addClass("playerDisplay"); 
            $('#player2').css('background-image', $thebackgroundImage); 

            //Disable this button
            $('#player2Button').attr('disabled', true);
            //Enable attack button
            $('#battleButton').attr('disabled', false);
        }
    })

   $('#battleButton').on("click", function(){
       
       $('#player1' ).effect("shake", {"times":"3", direction:"up"});
       $('#player2' ).effect("shake", {"times":"3", direction:"down"});
   });

});