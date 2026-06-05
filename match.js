const SUPABASE_URL ='https://dbfycihbcosuxxkrmbhl.supabase.co';

const SUPABASE_KEY ='sb_publishable_aOyXtAbzrrX0Z9jPAU1qEA_0ZnK35BX';

const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


let currentMarketName='';
let currentSide='';
let currentRate=0;
let currentRatio=0;
let currentAmount=0;

let popupOpen = false;

const mainbal =  sessionStorage.getItem("AccountBalance");
const userName = sessionStorage.getItem("loggedUser");


const urlParams =
new URLSearchParams(
window.location.search
);

const matchNo =
urlParams.get('match');



async function loadMatches() {

    const { data, error } = await supabaseClient
        .from('cmatches')
        .select('mid,mname')
        .order('mid');

    if (error) {
        console.log(error);
        return;
    }

    const container = document.getElementById("matchesContainer");
    container.innerHTML = "";

    data.forEach(match => {

        const div = document.createElement("div");
        div.className = "match-card";

        div.innerHTML = `
            <button onclick="openMatch(${match.mid}, '${match.mname}')">
                ${match.mname}
            </button>
        `;

        container.appendChild(div);
    });
}

function openMatch(mid,mname)
{
    localStorage.setItem("matchid",mid);
    localStorage.setItem("matchname",mname);

    location.href="match.html";
}

loadMatches();

const matchid = localStorage.getItem("matchid");
const matchname = localStorage.getItem("matchname");

document.getElementById("matchTitle").innerText = matchname;

document.getElementById("box1_f1").innerText = "-----";
document.getElementById("box1_f2").innerText = "------";
document.getElementById("box1_f3").innerText = "------";
document.getElementById("box1_f4").innerText = "------";

document.getElementById("box2_f1").innerText = "------";
document.getElementById("box2_f2").innerText = "------";
document.getElementById("box2_f3").innerText = "------";
document.getElementById("box2_f4").innerText = "------";

document.getElementById("box3_f1").innerText = "------";
document.getElementById("box3_f2").innerText = "------";
document.getElementById("box3_f3").innerText = "------";
document.getElementById("box3_f4").innerText = "------";




loadMarkets();

setInterval(() => {

    if(!popupOpen)
    {
        loadMarkets();
    }

}, 5000);




async function loadMarkets()
{
    
    const mainbal =  sessionStorage.getItem("AccountBalance");;
    const acntbal = document.getElementById("acntbal");
    
    acntbal.innerHTML = "💰 Balance: "+mainbal;


    const { data: blocks, error: blockError } =
    await supabaseClient
    .from('market_blocks')
    .select('*')
    .order('display_order');

    if(blockError)
    {
        console.log(blockError);
        return;
    }

       const { data: markets, error: marketError } =
        await supabaseClient
        .from('c_markets')
        .select('*')
        .eq('matchid', matchid)
        .order('block_id')
        .order('id');
        console.log(markets);
       
 


    if(marketError)
    {
        console.log(marketError);
        return;
    }

    let html = '';

    blocks.forEach(block => {

        html += `

        <div class="blockHeader">

            ${block.block_name}

        </div>

        <div class="header">

            <div class="headerTitle"></div>

            <div class="headerRates">

                <div>NO</div>

                <div>YES</div>

            </div>

        </div>

        `;
        const blockMarkets =
        markets.filter(
            m => m.block_id === block.id
        );

        blockMarkets.forEach(m => {

            html += `

            <div class="marketRow">

                <div class="marketName">
                ${m.market_name}

                ${!m.active ?
                '<span class="closedMark">🔒</span>'
                : ''}

               </div>

                <div
                     class="noBox ${m.active ? '' : 'marketClosed'}"

                        ${m.active ?

                    `onclick="openBet(
                    ${m.id},
                    'NO',
                    ${m.no_val},
                    ${m.no_ratio},
                    '${m.market_name}')"`

                    : ''

                        }>

                    <div class="rate">
                        ${m.no_val}
                    </div>

                    <div class="qty">
                        ${m.no_ratio}
                    </div>

                </div>

                <div
                    
                        class="yesBox ${m.active ? '' : 'marketClosed'}"

                        ${m.active ?

                        `onclick="openBet(
                        ${m.id},
                        'YES',
                        ${m.yes_val},
                        ${m.yes_ratio},
                        '${m.market_name}')"`

                        : ''

                        }>
                    <div class="rate">
                        ${m.yes_val}
                    </div>

                    <div class="qty">
                        ${m.yes_ratio}
                    </div>

                </div>

            </div>

            <div
            id="bet_${m.id}"
            class="betInfo"></div>
               `;

        });

    });


        let betCache = {};

        document
        .querySelectorAll('.betInfo')
        .forEach(el => {

            betCache[el.id] =
            el.innerHTML;

        });

    document.getElementById('markets').innerHTML = html;

    Object.keys(betCache)
.forEach(id => {

    const div =
    document.getElementById(id);

    if(div)
    {
        div.innerHTML =
        betCache[id];
    }

});

    //When the page loads, old bets should also appear.
    markets.forEach(m=>{    updateBetDisplay( m.id  );   });
}

function openBet(
id,
side,
rate,
ratio,
name)
{
    popupOpen = true;
    currentMarketId=id;
    currentMarketName=name;
    currentSide=side;
    currentRate=rate;
    currentRatio=ratio;

    document.getElementById(
    'popup').style.display='flex';

    document.getElementById(
    'popupTitle').innerHTML=
    name+
    ' | '+
    side+
    ' @ '+
    rate;

    document.getElementById(
    'selectedAmount').innerHTML='';
}



function setAmount(amount)
{
    currentAmount=amount;

    document.getElementById(
    'selectedAmount').innerHTML=    'Selected ₹'+amount;
}

async function confirmBet()
{
    if(currentAmount===0)
    {
        alert('Select Amount');
        return;
    }
    
    const mainbal1 =  sessionStorage.getItem("AccountBalance");;
    if(currentAmount > mainbal1){
        alert('insufficient Balance');
        return;
    }

    const { error } =
    await supabaseClient
    .from('c_user_bets')
    .insert([{


        user_name:userName,

        market_id:
        currentMarketId,

        market_name:
        currentMarketName,

        bet_side:
        currentSide,

        yn_val:
        currentRate,

        yn_ratio: currentRatio,

        bet_amount:
        currentAmount

    }]);

    if(error)
    {
        alert('Bet Failed');
        return;
    }

    await updateBetDisplay(currentMarketId);

    let updatedbal = mainbal1 - currentAmount;
    sessionStorage.setItem("AccountBalance", updatedbal);

    alert('Bet Confirmed');

    UpdateMainBalanceOfUserDetails();

    closePopup();
}

async function UpdateMainBalanceOfUserDetails (){

    let Mainbalchips1 = parseFloat(sessionStorage.getItem("AccountBalance"));
    let UserID = sessionStorage.getItem("UserID");

   const { data, error } = await supabaseClient
  .from("UserDetails")
  .update({ CBal: Mainbalchips1 })
  .eq("uid", UserID);


}

async function updateBetDisplay(
marketId
)
{
    const { data, error } =
    await supabaseClient
    .from('c_user_bets')
    .select('bet_side,bet_amount')
    .eq('market_id', marketId)
    .eq('user_name', userName);

    if(error)
    {
        console.log(error);
        return;
    }

    let noTotal = 0;
    let yesTotal = 0;

    if (!data || data.length === 0) {
      return;
    }

    data.forEach(row=>{

        if(row.bet_side === 'NO')
        {
            noTotal += Number(row.bet_amount);
        }
        else
        {
            yesTotal += Number(row.bet_amount);
        }

    });

    let displayText = '';

    if(noTotal > yesTotal)
    {
        displayText =
        'Bet : ₹' +
        (noTotal - yesTotal) +
        ' NO';
 
    }
    else
    if(yesTotal > noTotal)
    {
        displayText =
        'Bet : ₹' +
        (yesTotal - noTotal) +
        ' YES';
    }

    //document.getElementById('bet_' + marketId).innerHTML = displayText;
    document.getElementById('bet_' + marketId).innerHTML =
    `<span class="detailsBtn" onclick="loadOPenBetDetails(${marketId})">▤</span>`;
}


async function loadOPenBetDetails(marketId) {

    document.getElementById("openBetModal").style.display = "block";

  

    const { data, error } = await supabaseClient
        .from("c_user_bets")
        .select("market_name, bet_amount, bet_side, yn_val, yn_ratio")
        .eq("user_name", userName);

    if (error) {
        document.getElementById("openBetContent").innerHTML =
            "Error loading bets";
        return;
    }

    let html = `
        <table class="betTable">
            <tr>
                <th>MARKET</th>
                <th>VALUE</th>
                <th>BET AMOUNT</th>
                <th>SIDE</th>
                <th>RATIO</th>
            </tr>
    `;

    data.forEach(row => {
        html += `
            <tr>
                <td>${row.market_name}</td>
                 <td>${row.yn_val}</td>
                <td>${row.bet_amount}</td>
                <td>${row.bet_side}</td>
                <td>${row.yn_ratio}</td>
            </tr>
        `;
    });

    html += "</table>";

    document.getElementById("openBetContent").innerHTML = html;
}

function closeOpenBetModal() {
    document.getElementById("openBetModal").style.display = "none";
}


function closePopup()
{
    popupOpen = false;

    document.getElementById('popup').style.display = 'none';

    document.getElementById('selectedAmount').innerHTML = '';

    currentAmount = 0;

    currentMarketId = 0;

    currentMarketName = '';

    currentSide = '';

    currentRate = 0;

    currentRatio  = 0;
}


