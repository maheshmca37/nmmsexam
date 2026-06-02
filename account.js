//const supabase = window.supabase;

const uid = sessionStorage.getItem("UserID");
const uname = sessionStorage.getItem("loggedUser");

let senderBankData = null;
let withdrawAmountSelected = 0;

/* ===========================
   BUTTONS
=========================== */

const btnDeposit = document.getElementById("btnDeposit");
const btnWithdraw = document.getElementById("btnWithdraw");
const btnGameHistory = document.getElementById("btnGameHistory");
const btnStatement = document.getElementById("btnStatement");
const btnHome = document.getElementById("btnHome");
const btnResetpwrd = document.getElementById("btnResetpwrd")

const depositBox = document.getElementById("depositBox");
const withdrawBox = document.getElementById("withdrawBox");
const gameHistoryBox = document.getElementById("gameHistoryBox");
const statementBox = document.getElementById("statementBox");
const pwrdResetBox = document.getElementById("pwrdResetBox");

const qrBox = document.getElementById("qrBox");
const bankBox = document.getElementById("bankBox");

const depositConfirmBox = document.getElementById("depositConfirmBox");

const withdrawDetailsBox = document.getElementById("withdrawDetailsBox");
const bankUpdateBox = document.getElementById("bankUpdateBox");

/* ===========================
   STARTUP
=========================== */

hideAllSections();

btnDeposit.addEventListener("click", () => {
    hideAllSections();
    depositBox.style.display = "block";
});

btnWithdraw.addEventListener("click", () => {
    hideAllSections();
    withdrawBox.style.display = "block";
});

btnGameHistory.addEventListener("click", async () => {
    hideAllSections();
    gameHistoryBox.style.display = "block";
    await loadGameHistory();
});

btnStatement.addEventListener("click", async () => {
    hideAllSections();
    statementBox.style.display = "block";
    await loadStatement();
});


btnResetpwrd.addEventListener("click", async () => {
    hideAllSections();
    pwrdResetBox.style.display = "block";
    await doResetpwrdProcess();
});

btnHome.addEventListener("click", () => {
    location.href = "index.html";
});

function hideAllSections() {
    depositBox.style.display = "none";
    withdrawBox.style.display = "none";
    gameHistoryBox.style.display = "none";
    statementBox.style.display = "none";
    pwrdResetBox.style.display = "none";
}

/* ===========================
   DEPOSIT TYPE SWITCH
=========================== */

document
.querySelectorAll('input[name="depositType"]')
.forEach(radio => {

    radio.addEventListener("change", async () => {

        if (radio.value === "QR" && radio.checked) {

            qrBox.style.display = "block";
            bankBox.style.display = "none";
        }

        if (radio.value === "BANK" && radio.checked) {

            qrBox.style.display = "none";
            bankBox.style.display = "block";

            await loadSenderBankDetails();
        }
    });
});

/* ===========================
   LOAD ACTIVE SENDER BANK
=========================== */

async function loadSenderBankDetails() {

    const { data, error } = await supabase
        .from("senderbankdetails")
        .select("*")
        .eq("senderactivestatus", true)
        .single();

    if (error || !data) {

        alert("Active sender account not found");
        return;
    }

    senderBankData = data;

    document.getElementById("senderAcNo").textContent =
        data.sacntno || "";

    document.getElementById("senderIfsc").textContent =
        data.sacntifsc || "";

    document.getElementById("senderBank").textContent =
        data.sacntbank || "";

    document.getElementById("senderName").textContent =
        data.sacntname || "";
}

/* ===========================
   DEPOSIT VALIDATION
=========================== */

document
.getElementById("depositValidateBtn")
.addEventListener("click", () => {

    const msg =
        document.getElementById("depositMsg");

    msg.textContent = "";

    const amount =
        parseInt(
            document.getElementById("depositAmount").value
        );

    if (isNaN(amount)) {

        msg.textContent =
            "Enter deposit amount";

        return;
    }

    if (amount < 100 || amount > 20000) {

        document.getElementById("depositAmount").value = "";

        msg.textContent =
            "Amount should be between 100 and 20000";

        return;
    }

    const selectedType =
        document.querySelector(
            'input[name="depositType"]:checked'
        ).value;

    if (selectedType === "QR") {

        if (amount < 100 || amount > 2000) {

            msg.textContent =
                "QR deposits allowed only between 100 and 2000";

            return;
        }
    }

    depositConfirmBox.style.display = "block";
});

/* ===========================
   DEPOSIT CONFIRM
=========================== */

document
.getElementById("depositConfirmBtn")
.addEventListener("click", async () => {

    const msg =
        document.getElementById("depositConfirmMsg");

    msg.textContent = "";

    const transid =
        document.getElementById("transactionId")
        .value
        .trim();

    const screenshot =
        document.getElementById("screenshotFile")
        .files[0];

    if (
    !/^[A-Za-z0-9]+$/.test(transid) ||
    transid.length < 8 ||
    transid.length > 15
    ) {

        msg.textContent =
            "Valid Bank Transaction ID ";

        return;
    }

    if (!screenshot) {

        msg.textContent =
            "Please upload screenshot";

        return;
    }

    const amount =
        parseInt(
            document.getElementById("depositAmount").value
        );

    const insertData = {

        uid: uid,
        uname: uname,

        acntnum:
            senderBankData
                ? senderBankData.sacntno
                : null,

        deposamnt: amount,

        transid: transid,
        status:'PENDING',
        remarks:'WAIT 10 Mins',

        createdat:
            new Date().toISOString()
    };

    const { error } =
        await supabase
        .from("usertransactions")
        .insert([insertData]);

    if (error) {

        msg.textContent =
            "Deposit submission failed";

        console.log(error);

        return;
    }

    msg.style.color = "green";

    msg.textContent =
        "Deposit Requested Success";

});


/* ===========================
   HELP BUTTON
=========================== */

document
.getElementById("helpBtn")
.addEventListener("click", helpFunction);

function helpFunction() {

    // update later

}

/* ===========================
   WITHDRAW VALIDATION
=========================== */

document
.getElementById("withdrawSubmitBtn")
.addEventListener("click", async () => {

    const msg =
        document.getElementById("withdrawMsg");

    msg.textContent = "";

    const amount =
        parseInt(
            document.getElementById("withdrawAmount").value
        );

    if (isNaN(amount)) {

        msg.textContent =
            "Enter withdraw amount";

        return;
    }

    if (amount < 100 || amount > 50000) {

        msg.textContent =
            "Withdraw amount should be between 100 and 50000";

        return;
    }

    withdrawAmountSelected = amount;

    await loadUserBankDetails();

    withdrawDetailsBox.style.display = "block";
});

/* ===========================
   LOAD USER BANK DETAILS
=========================== */

async function loadUserBankDetails() {

    const { data, error } =
        await supabase
        .from("UserDetails")
        .select("*")
        .eq("uid", uid)
        .single();

    if (error || !data) {

        document.getElementById("usrAcNo").textContent = "";
        document.getElementById("usrIfsc").textContent = "";
        document.getElementById("usrBank").textContent = "";
        document.getElementById("usrName").textContent = "";

        return;
    }

    document.getElementById("usrAcNo").textContent =
        data.usracntno || "";

    document.getElementById("usrIfsc").textContent =
        data.usracntifsc || "";

    document.getElementById("usrBank").textContent =
        data.usracntbank || "";

    document.getElementById("usrName").textContent =
        data.usracntname || "";
}

/* ===========================
   OPEN UPDATE PANEL
=========================== */

document
.getElementById("editBankBtn")
.addEventListener("click", async () => {

    bankUpdateBox.style.display = "block";

    const { data } =
        await supabase
        .from("UserDetails")
        .select("*")
        .eq("uid", uid)
        .single();

    if (!data)
        return;

    document.getElementById("updateAcNo").value =
        data.usracntno || "";

    document.getElementById("updateIfsc").value =
        data.usracntifsc || "";

    document.getElementById("updateBank").value =
        data.usracntbank || "";

    document.getElementById("updateName").value =
        data.usracntname || "";
});

/* ===========================
   SAVE BANK DETAILS
=========================== */

document
.getElementById("saveBankBtn")
.addEventListener("click", async () => {

    const msg =
        document.getElementById("bankUpdateMsg");

    msg.textContent = "";

    const acno =
        document.getElementById("updateAcNo")
        .value
        .trim();

    const ifsc =
        document.getElementById("updateIfsc")
        .value
        .trim();

    const bank =
        document.getElementById("updateBank")
        .value
        .trim();

    const name =
        document.getElementById("updateName")
        .value
        .trim();

    if (
        !acno ||
        !ifsc ||
        !bank ||
        !name
    ) {

        msg.textContent =
            "All fields are mandatory";

        return;
    }

    if (!/^\d+$/.test(acno)) {

        msg.textContent =
            "Account number must contain digits only";

        return;
    }

    const { data } =
        await supabase
        .from("UserDetails")
        .select("uid")
        .eq("uid", uid)
        .single();

    let error;

    if (data) {

        ({ error } =
            await supabase
            .from("UserDetails")
            .update({
                usracntno: acno,
                usracntifsc: ifsc,
                usracntbank: bank,
                usracntname: name
            })
            .eq("uid", uid));
    }
    else {

        ({ error } =
            await supabase
            .from("UserDetails")
            .insert([{
                uid: uid,
                usracntno: acno,
                usracntifsc: ifsc,
                usracntbank: bank,
                usracntname: name
            }]));
    }

    if (error) {

        msg.textContent =
            "Update failed";

        console.log(error);

        return;
    }

    msg.style.color = "green";

    msg.textContent =
        "Updated successfully. Please verify details carefully. We are not responsible for incorrect bank details.";

    await loadUserBankDetails();

});

/* ===========================
   CONFIRM WITHDRAW
=========================== */

document
.getElementById("confirmWithdrawBtn")
.addEventListener("click", async () => {

    if (!withdrawAmountSelected) {

        alert("Invalid withdraw amount");

        return;
    }

    

    let Mainbal =  parseFloat(sessionStorage.getItem("AccountBalance"));
    if (withdrawAmountSelected > Mainbal){
        
        alert("Insufficient Balance. Available Balance: "+Mainbal);

        return;
    }

    const { error } =
        await supabase
        .from("usertransactions")
        .insert([{

            uid: uid,

            uname: uname,

            withdrawamnt:
                withdrawAmountSelected,
            status:'PENDING',
            remarks:'WAIT 30 Mins',
            

            createdat:
                new Date().toISOString()

        }]);

    if (error) {

        alert("Withdraw request failed");

        console.log(error);

        return;
    }


    alert(
        "Withdrawal request submitted successfully"
    );

    let updatedbal = Mainbal - withdrawAmountSelected;
    sessionStorage.setItem("AccountBalance", updatedbal);
   
    const updateResult = await supabase
    .from("UserDetails")
    .update({
        CBal: updatedbal
    })
    .eq("uid", uid);




});


/* ===========================
   LOAD GAME HISTORY
=========================== */

async function loadGameHistory() {

    const body =
        document.getElementById("gameHistoryBody");

    body.innerHTML = "";

    const { data, error } =
        await supabase
        .from("UserActivity")
        .select("*")
        .eq("uid", uid)
        .order("datetime", {
            ascending: false
        });

    if (error) {

        console.log(error);
        return;
    }

    data.forEach(row => {

        body.innerHTML += `
        <tr>
            <td>${row.playedgamename ?? ''}</td>
            <td>${row.CBal ?? ''}</td>
            <td>${row.betamnt ?? ''}</td>
            <td>${row.winamnt ?? ''}</td>
            <td>${row.finalbal ?? ''}</td>
           <td>${row.datetime ? row.datetime.substring(0, 19).replace('T', ' ') : ''}</td>
        </tr>`;
    });
}

/* ===========================
   LOAD ACCOUNT STATEMENT
=========================== */

async function loadStatement() {

    const body =
        document.getElementById("statementBody");

    body.innerHTML = "";

    const { data, error } =
        await supabase
        .from("usertransactions")
        .select("*")
        .eq("uid", uid)
        .order("createdat", {
            ascending: false
        });

    if (error) {

        console.log(error);
        return;
    }

    data.forEach(row => {

        body.innerHTML += `
        <tr>
           <td>${new Date(row.createdat).toLocaleString()}</td>
            <td>${row.deposamnt ?? ''}</td>
            <td>${row.withdrawamnt ?? ''}</td>
            <td>${row.status ?? ''}</td>
            <td>${row.remarks ?? ''}</td>
        </tr>`;
    });
}


document.getElementById("resetPasswordBtn").addEventListener("click", async () => {

    const uid = sessionStorage.getItem("UserID");

    const currentPassword =
        document.getElementById("currentPassword").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const confirmPassword =
        document.getElementById("confirmPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please Enter All Details");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New Password and Confirm Password do not match");
        return;
    }

    // Load existing password
    const { data, error } = await supabase
        .from("UserDetails")
        .select("password")
        .eq("uid", uid)
        .single();

    if (error) {
        alert("Unable To Load Old Password");
        return;
    }

    // Verify old password
    if (data.password !== currentPassword) {
        alert("Entered Current Password is Incorrect");
        return;
    }

    // Update password
    const { error: updateError } = await supabase
        .from("UserDetails")
        .update({
            password: newPassword
        })
        .eq("uid", uid);

    if (updateError) {
        alert("Password Update Failed at Server");
        return;
    }

    alert("Password Updated Successfully. Please Login Again.");

// Clear session data
     sessionStorage.clear();

// Redirect to login page
   window.location.href = "index.html";
});


/* Do Reset password process here */
async function doResetpwrdProcess(){
  /*........*/
  

}

/* ===========================
   DEFAULT UI
=========================== */

qrBox.style.display = "block";
bankBox.style.display = "none";

depositConfirmBox.style.display = "none";
withdrawDetailsBox.style.display = "none";
bankUpdateBox.style.display = "none";

