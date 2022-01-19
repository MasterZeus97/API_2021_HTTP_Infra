$(function(){
    console.log("Loading quote");
    $("#quote").text("test");

    function loadQuote(){
        $.getJSON( "/api/quote/", function(quote){
            console.log("Quote");
            var message = "No quotes today!";

            message = "\"" + quote.sentence + "\" - " + quote.firstName + " " + quote.lastName;

            $("#quote").text(message);
        });
    };

    loadQuote();
    setInterval(loadQuote, 5000);
});