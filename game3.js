/* =========================
   GLOBAL VARIABLES
========================= */

let Mainbalchips =  parseFloat(sessionStorage.getItem("AccountBalance"));

let gameID = 103 ;
let gameName = "MIN7  OR MAX7"

let rbetAmnt = 0.00 ;
let rbetStatus = false;

let currentSelected = "";

let selectedChip = 0;

let currentCardValue = 5;

let betConfirmed = false;

let resultHistory = ['6','2','10'];




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



 let UserID = sessionStorage.getItem("UserID");
 if ( UserID == null) {
   balText.innerHTML =    "Sign In Users Only Place Bets ";
 }
 else{
    balText.innerHTML =    "Balance : " +    Mainbalchips;
 }






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
     
   const random15to45 = (Math.floor(Math.random() * (45 - 15 + 1)) + 15) * 700;
   const random21to31 = (Math.floor(Math.random() * (31 - 21 + 1)) + 21)* 700;


   roundstatus.innerHTML = "Last Round Stats >>>>> Won:  + " + random15to45 +" ::::" +"  Lost:  - " + random21to31;

}


/* =========================
   SHOW RESULT CARD
========================= */
function showResultCard(value) {

    deckImg.style.display = "none";

    const cards = [
        "", "A", "2", "3", "4", "5", "6",
        "7", "8", "9", "10", "J", "Q", "K"
    ];

    cardNumber.innerHTML = cards[value] || "?";

    cardNumber.classList.add("showNumber");
}

/* =========================
   UPDATE HISTORY
========================= */
function updateHistory(value) {

    const cards = [
        "", "A", "2", "3", "4", "5", "6",
        "7", "8", "9", "10", "J", "Q", "K"
    ];

    resultHistory.unshift(cards[value] || "?");

    if (resultHistory.length > 3) {
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

    currentSelected = "MIN7";

    minBtn.classList.add("selectedChoice");

    maxBtn.classList.remove("selectedChoice");

    
    if(UserID == null){
       betConfirmed = false;   
       alert('Sign In Users Only Place Bets') ;
    }
    else{
      message.innerHTML =   "Selected : MIN7";
    }
    

});


/* =========================
   MAX BUTTON
========================= */

maxBtn.addEventListener("click", ()=>{

    currentSelected = "MAX7";

    maxBtn.classList.add("selectedChoice");

    minBtn.classList.remove("selectedChoice");

     if(UserID == null){
       betConfirmed = false;   
       alert('Sign In Users Only Place Bets') ;
    }
    else{
       message.innerHTML =   "Selected : MAX7";
    }
    

});


/* =========================
   CHALLENGE BUTTON
========================= */

challengeBtn.addEventListener("click", ()=>{

    
   if(UserID == null){
    return;
   }

    if(selectedChip <= 0){

        message.innerHTML =
        "Select chips first";

        return;

    }

    if(currentSelected == ""){

        message.innerHTML =
        "MIN7 OR MAX7";

        return;

    }

    if(Mainbalchips < selectedChip){

        message.innerHTML =
        "Insufficient balance";

        return;

    }

    betConfirmed = true;


    disableButtons();

    message.innerHTML =    "Bet Confirmed : " +    currentSelected +
    " | " +
    selectedChip;

   updatecurbettoDB(currentSelected,selectedChip);
});

async function updatecurbettoDB(currentSelected,selectedChip) {
    
  let cursel = currentSelected;
  let selchips = selectedChip;
  const { data, error } = await supabase
  .from("game3_betvalue")
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

    if(currentSelected == "MIN7" &&
       currentCardValue <= 7 ){

        won = true;

    }

    if(currentSelected == "MAX7" &&
       currentCardValue >= 7){

        won = true;

    }

    if(currentCardValue == 7){

        won = false;

    }

    if(won){

        Mainbalchips += selectedChip;

        rbetStatus = true;
       
        message.innerHTML =        "YOU WON +" +   selectedChip;

    }
    else{

        Mainbalchips -= selectedChip;

        rbetStatus = false;

        message.innerHTML =        "YOU LOST -" +    selectedChip;

    }
    rbetAmnt = selectedChip;
    
    sessionStorage.setItem("AccountBalance", Mainbalchips);


    balText.innerHTML =    "Balance : " + sessionStorage.getItem("AccountBalance");
    
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
  let finalbal1 = 0.00;

  
if (rbetStatus === true) {

    finalbal1 = crntBal - rbetAmnt;
    winamnt = rbetAmnt;

} else if (rbetStatus === false){

    finalbal1 = crntBal + rbetAmnt;
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
      CBal: finalbal1,
      betamnt: rbetAmnt,
      winamnt: winamnt,
      finalbal: crntBal
    }
  ]);
}


/* =========================
   START ROUND
========================= */



async function getCurrentRoundValue_game3(){
   const { data, error } = await supabase.rpc("sendgame3_curvalue");

   return data;

}



/* =========================
   ROUND SYNC VARIABLES
========================= */

let lastRoundNo = 0;

let videoStarted = false;

let resultShown = false;


/* =========================
   RESET ROUND
========================= */

function resetRound(){

    betConfirmed = false;

    currentSelected = "";

    selectedChip = 0;

    videoStarted = false;

    resultShown = false;

    minBtn.classList.remove("selectedChoice");

    maxBtn.classList.remove("selectedChoice");
    card.classList.remove("resultFlash");

    chipButtons.forEach(btn=>{

        btn.classList.remove("selectedChip");

    });

    showDeck();

    girlVideo.pause();

    girlVideo.currentTime = 0;

    card.classList.remove("pickAnim");

    enableButtons();

    message.innerHTML = "";
}


/* =========================
   BETTING STATE
========================= */

function bettingState(elapsed){

    if(!betConfirmed){

       enableButtons();

    }

    let remaining = 18 - elapsed;

    timerText.innerHTML =
    "Bet Time : " +
    remaining +
    " sec";
}


/* =========================
   VIDEO STATE
========================= */

function videoState(){
    roundstatus.innerHTML = "";
    disableButtons();

    timerText.innerHTML =
    "Picking Card...";

    if(!videoStarted){

        videoStarted = true;

        girlVideo.currentTime = 0;

        girlVideo.play();

        pickCardAnim.classList.remove("animatePick");

        void pickCardAnim.offsetWidth;

        pickCardAnim.classList.add("animatePick");

        card.classList.add("pickAnim");
    }
}


/* =========================
   RESULT STATE
========================= */

function resultState(value){

    if(value == null){
      return;
    }

    timerText.innerHTML =
    "Result Showing...";

    disableButtons();

    if(!resultShown){

        resultShown = true;

        card.classList.remove("pickAnim");
        card.classList.add("resultFlash");
        setValue(value);

        showResultCard(value);

        updateHistory(value);

        processResult();
    }
}


/* =========================
   WAIT STATE
========================= */

function waitState(){

    disableButtons();

   // timerText.innerHTML =    "Next Round Starting...";
}


/* =========================
   HANDLE GAME STATE
========================= */

function handleGameState(elapsed,data){

    // NEW ROUND DETECTED
    if(data.round_no != lastRoundNo){

        lastRoundNo = data.round_no;

        resetRound();
    }

    // RESULT AVAILABLE
    if(data.result_value !== null){

        resultState(data.result_value);

        return;
    }

    // BETTING
    if(elapsed >= 0 && elapsed < 18){

        bettingState(elapsed);
    }

    // VIDEO
    else if(elapsed >= 18 && elapsed < 27){

        videoState();
    }

    // WAIT
    else{

        waitState();
    }
}

/* =========================
   SYNC ROUND
========================= */

async function syncRound(){

    const { data, error } = await supabase
    .from("game3_CurrentRound")
    .select("*")
    .eq("id",1)
    .single();

    if(error){

        console.log(error);

        return;
    }

    const startTime =
    new Date(data.start_time).getTime();

    const now =
    new Date().getTime();

    const elapsed =
    Math.floor((now - startTime)/1000);

    handleGameState(elapsed,data);
}


/* =========================
   PAGE LOAD
========================= */

window.onload = ()=>{

    syncRound();

    setInterval(()=>{

        syncRound();

    },1000);
};

