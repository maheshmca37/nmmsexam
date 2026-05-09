/* =========================
   GLOBAL VARIABLES
========================= */

let Mainbalchips = 5000;

let currentSelected = "";

let selectedChip = 0;

let currentCardValue = 5;

let betConfirmed = false;

let resultHistory = [5,8,3];




/* =========================
   ELEMENTS
========================= */

const card = document.getElementById("gameCard");

const deckImg = document.getElementById("deckImg");

const cardNumber =
document.getElementById("cardNumber");

const timerText =
document.getElementById("timer");

const balText =
document.getElementById("balText");

const message =
document.getElementById("message");

const lastResults =
document.getElementById("lastResults");

const minBtn =
document.getElementById("minBtn");

const maxBtn =
document.getElementById("maxBtn");

const challengeBtn =
document.getElementById("challengeBtn");

const chipButtons =
document.querySelectorAll(".chipBtn");


const pickCardAnim =
document.getElementById("pickCardAnim");

const girlVideo =
document.getElementById("girlVideo");

/* =========================
   SET VALUE FUNCTION
========================= */

function setValue(value){

    currentCardValue = value;

}


/* =========================
   SHOW DECK
========================= */

function showDeck(){

    deckImg.style.display = "block";

    cardNumber.classList.remove("showNumber");

}


/* =========================
   SHOW RESULT CARD
========================= */

function showResultCard(value){

    deckImg.style.display = "none";

    cardNumber.innerHTML = value;

    cardNumber.classList.add("showNumber");

}


/* =========================
   UPDATE HISTORY
========================= */

function updateHistory(value){

    resultHistory.unshift(value);

    if(resultHistory.length > 3){

        resultHistory.pop();

    }

    lastResults.innerHTML =
    "Last Results : " +
    resultHistory.join(" , ");

}


/* =========================
   ENABLE BUTTONS
========================= */

function enableButtons(){

    minBtn.disabled = false;

    maxBtn.disabled = false;

    challengeBtn.disabled = false;

    chipButtons.forEach(btn=>{

        btn.disabled = false;

    });

}


/* =========================
   DISABLE BUTTONS
========================= */

function disableButtons(){

    minBtn.disabled = true;

    maxBtn.disabled = true;

    challengeBtn.disabled = true;

    chipButtons.forEach(btn=>{

        btn.disabled = true;

    });

}


/* =========================
   CHIP BUTTONS
========================= */

chipButtons.forEach(btn=>{

    btn.addEventListener("click", ()=>{

        chipButtons.forEach(b=>{

            b.classList.remove("selectedChip");

        });

        btn.classList.add("selectedChip");

        selectedChip =
        parseInt(btn.innerText);

    });

});


/* =========================
   MIN BUTTON
========================= */

minBtn.addEventListener("click", ()=>{

    currentSelected = "MIN6";

    minBtn.classList.add("selectedChoice");

    maxBtn.classList.remove("selectedChoice");

    message.innerHTML =
    "Selected : MIN6";

});


/* =========================
   MAX BUTTON
========================= */

maxBtn.addEventListener("click", ()=>{

    currentSelected = "MAX6";

    maxBtn.classList.add("selectedChoice");

    minBtn.classList.remove("selectedChoice");

    message.innerHTML =
    "Selected : MAX6";

});


/* =========================
   CHALLENGE BUTTON
========================= */

challengeBtn.addEventListener("click", ()=>{

    if(selectedChip <= 0){

        message.innerHTML =
        "Select chips first";

        return;

    }

    if(currentSelected == ""){

        message.innerHTML =
        "Select MIN6 or MAX6";

        return;

    }

    if(Mainbalchips < selectedChip){

        message.innerHTML =
        "Insufficient balance";

        return;

    }

    betConfirmed = true;
    disableButtons();

    message.innerHTML =
    "Bet Confirmed : " +
    currentSelected +
    " | " +
    selectedChip;

});


/* =========================
   PROCESS RESULT
========================= */

function processResult(){

    if(!betConfirmed){

        return;

    }

    let won = false;

    if(currentSelected == "MIN6" &&
       currentCardValue < 6){

        won = true;

    }

    if(currentSelected == "MAX6" &&
       currentCardValue > 6){

        won = true;

    }

    if(currentCardValue == 6){

        won = false;

    }

    if(won){

        Mainbalchips += selectedChip;

        message.innerHTML =
        "YOU WON +" +
        selectedChip;

    }
    else{

        Mainbalchips -= selectedChip;

        message.innerHTML =
        "YOU LOST -" +
        selectedChip;

    }

    balText.innerHTML =
    "Balance Chips : " +
    Mainbalchips;

}


/* =========================
   START ROUND
========================= */

function startRound(){

    betConfirmed = false;

    currentSelected = "";

    selectedChip = 0;

    minBtn.classList.remove("selectedChoice");

    maxBtn.classList.remove("selectedChoice");

    chipButtons.forEach(btn=>{

        btn.classList.remove("selectedChip");

    });

    enableButtons();

    showDeck();

    // RESET VIDEO
    girlVideo.pause();

    girlVideo.currentTime = 0;

    let timeLeft = 18;

    timerText.innerHTML =
    "Bet Time : " +
    timeLeft +
    " sec";


    let waitTimer = setInterval(()=>{

        timeLeft--;

        timerText.innerHTML =
        "Bet Time : " +
        timeLeft +
        " sec";


        // WHEN TIMER REACHES 1
        if(timeLeft <= 0){

            clearInterval(waitTimer);

            disableButtons();

            // SHOW PICKING MESSAGE
            timerText.innerHTML =
            "Picking Card...";


            // START VIDEO
            girlVideo.currentTime = 0;

            girlVideo.play();


            // CARD PICK EFFECT
            pickCardAnim.classList.remove("animatePick");

            void pickCardAnim.offsetWidth;

            pickCardAnim.classList.add("animatePick");

            card.classList.add("pickAnim");


            // WAIT 9 SECONDS (VIDEO DURATION)
            setTimeout(()=>{

                card.classList.remove("pickAnim");

                // RANDOM NUMBER 2 TO 10
                let value =
                Math.floor(Math.random()*9)+2;

                setValue(value);

                showResultCard(value);

                updateHistory(value);

                processResult();

                timerText.innerHTML =
                "Result Showing...";


                // NEXT ROUND
                setTimeout(()=>{

                    startRound();

                },3000);

            },9000);

        }

    },1000);

}


/* =========================
   PAGE LOAD
========================= */

window.onload = ()=>{

    startRound();

};