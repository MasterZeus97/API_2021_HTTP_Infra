$(function(){
    console.log("Starting quote script");
    $("#quote").text("test");

    function loadQuote(){
        console.log("Loading quote");
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

