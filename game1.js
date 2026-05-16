/* =========================
   GLOBAL VARIABLES
========================= */

let Mainbalchips =  parseFloat(sessionStorage.getItem("AccountBalance"));

let gameID = 101 ;
let gameName = "MIN MAX 6"

let rbetAmnt = 0.00 ;
let rbetStatus = false;

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


balText.innerHTML =    "Balance : " +    Mainbalchips;






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


   updatecurbettoDB(currentSelected,selectedChip);
});

async function updatecurbettoDB(currentSelected,selectedChip) {
    
  let cursel = currentSelected;
  let selchips = selectedChip;
  const { data, error } = await supabase
  .from("game1_betvalue")
  .insert([
    {
      selected: cursel,
      value: selchips
    }
  ]);

}


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

        rbetStatus = true;
       
        message.innerHTML =        "YOU WON +" +   selectedChip;

    }
    else{

        Mainbalchips -= selectedChip;

        message.innerHTML =        "YOU LOST -" +    selectedChip;

    }
    rbetAmnt = selectedChip;
    
    sessionStorage.setItem("AccountBalance", Mainbalchips);


    balText.innerHTML =    "Balance : " + sessionStorage.getItem("AccountBalance");;
    
     updateUserDetailsToDB();
     updateUserActivityToDB();


}


async function updateUserDetailsToDB(){
    let Mainbalchips1 = parseFloat(sessionStorage.getItem("AccountBalance"));
    let UserID = sessionStorage.getItem("UserID");

   const { data, error } = await supabase
  .from("UserDetails")
  .update({ CBal: Mainbalchips1 })
  .eq("uid", UserID);

}

async function updateUserActivityToDB(){

  let userid = parseInt(sessionStorage.getItem("UserID"));
  let usrname = sessionStorage.getItem("loggedUser");
  let crntBal = parseFloat(sessionStorage.getItem("AccountBalance"));
  let winamnt = 0.00;
  let finalbal = 0.00;

  
if (rbetStatus === true) {

    finalbal = crntBal - rbetAmnt;
    winamnt = rbetAmnt;

} else {

    finalbal = crntBal + rbetAmnt;
    winamnt = -rbetAmnt;
}

const { data, error } = await supabase
  .from("UserActivity")  
  .insert([
    {
      uid: userid,
      uname: usrname,
      plyedgameid: gameID,
      playedgamename: gameName,
      CBal: finalbal,
      betamnt: rbetAmnt,
      winamnt: winamnt,
      finalbal: crntBal,
      datetime : new Date().toISOString()
    }
  ]);

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
            setTimeout(async()=>{

                card.classList.remove("pickAnim");

                // RANDOM NUMBER 2 TO 10
                //let value =  Math.floor(Math.random()*9)+2;

                
                let value = await getCurrentRoundValue();


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



async function getCurrentRoundValue(){
   const { data, error } = await supabase.rpc("sendgame1_curvalue");

   return data;

}



/* =========================
   PAGE LOAD
========================= */

window.onload = ()=>{

    startRound();

};