let pswrd="";
let usrname="";

var examDur = {
  examduration: 0
};


loadExamDetails();

function loadExamDetails(){
fetch('user.json')
  .then(response => response.json())
  .then(udata => {
    pswrd= udata[0].pwrd;
  //  usrname=udata[0].usr;
     examDur.examduration = udata[0].duration;
    //examduration=udata[0].duration;

  })
  .catch(error => console.error('Error fetching JSON:', error));
}


document.getElementById('phone').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '');
});

// script.js
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting
    
    // Get values from the form
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    
    if(password==pswrd){
        window.location.href = "exam.html";
    }
    else {
      alert("Invalid User");
    }
    
  });

  function displayText() {
    // Replace this with your dynamic text assignment logic
    var dynamicText = "Hi....\n 1.Make sure your Internet good connectivity and battery\n 2.After completio of your exam download your response sheet";
    dynamicText = dynamicText+"\n 3. Exam will be closed automatically once specified duration completed";

    dynamicText = dynamicText+"\n 4. Timer is running down once you click on login and exam will starts immediatly"

    alert(dynamicText);
}
  