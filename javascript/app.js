

// function onSignIn(googleUser) {
//     var profile = googleUser.getBasicProfile();
//     console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
//     console.log('Name: ' + profile.getName());
//     console.log('Image URL: ' + profile.getImageUrl());
//     console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
//   }
// $(".jumbotron-fluid").hide();

// function onSignIn(googleUser) {
//     var profile = googleUser.getBasicProfile();
//     console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
//     console.log('Name: ' + profile.getName());
//     console.log('Image URL: ' + profile.getImageUrl());
//     console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
//   }

var config = {
    apiKey: "AIzaSyDf9t0yxkCKyvoyu5AU_CNLmjxEgzbuuv4",
    authDomain: "train-scheduler-3b668.firebaseapp.com",
    databaseURL: "https://train-scheduler-3b668.firebaseio.com",
    projectId: "train-scheduler-3b668",
    storageBucket: "train-scheduler-3b668.appspot.com",
    messagingSenderId: "436996825684"
};
firebase.initializeApp(config);

var nextTrain;
var minTilTrain;
var editTrainKey = "";
// Create a variable to reference the database.
var database = firebase.database();

// Initial Values
var trainname = "";
var destnation = "";
var firsttraintime = "";
var frequency = "";
var currentTime = moment();
// Capture Button Click
$(".btn").on("click", function (event) {
    event.preventDefault();

    // Grabbed values from text boxes
    trainname = $("#trainname").val().trim();
    destnation = $("#destination").val().trim();
    firsttraintime = $("#firsttraintime").val().trim();
    frequency = $("#frequency").val().trim();
    time = moment().format('X');


    if (editTrainKey == '') {
        // Code for handling the push
        database.ref().push({
            trainname: trainname,
            destnation: destnation,
            firsttraintime: firsttraintime,
            frequency: frequency,
            currenttime: time
            // dateAdded: firebase.database.ServerValue.TIMESTAMP

        });
    } else if (editTrainKey != '') {
        database.ref(editTrainKey).update({
            trainname: trainname,
            destnation: destnation,
            firsttraintime: firsttraintime,
            frequency: frequency,
            currenttime: time
            // dateAdded: firebase.database.ServerValue.TIMESTAMP

        });
        editTrainKey = '';
    }
    window.location.reload();
});



// Firebase watcher .on("child_added"
database.ref().on("child_added", function (snapshot) {
    // storing the snapshot.val() in a variable for convenience
    var sv = snapshot.val();

    // Console.loging the last user's data
    console.log(sv.trainname);
    console.log(sv.destnation);
    console.log(sv.firsttraintime);
    console.log(sv.frequency);
    console.log(snapshot.key);

    var trainName = sv.trainname;
    var trainDestination = sv.destnation;
    var trainFirstTime = sv.firsttraintime;
    var trainFreq = sv.frequency;
    var key = snapshot.key;

    var firstTimeConverted = moment(trainFirstTime, "HH:mm").subtract(1, "years");
    console.log("TIME CONVERTED: " + firstTimeConverted);

    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    var timeRemaining = diffTime % trainFreq;
    console.log("Time Remaining " + timeRemaining);

    minTilTrain = trainFreq - timeRemaining;
    console.log("MINUTES TILL TRAIN: " + minTilTrain);

    // setInterval(minTilTrain, 5000);

    nextTrain = moment().add(minTilTrain, "minutes");
    var nextTrainPretty = moment(nextTrain).format("h:mm");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("h:mm"));


    $('.table').append(
        `<tbody>
        <tr>
          <th>${trainName}</th>
          <td>${trainDestination}</td>
          <td>${trainFreq}</td>
          <td>${nextTrainPretty}</td>
          <td>${minTilTrain}</td>
          <td>
          <button type="submit" class="btn btn-primary" id="remove" data-key="${key}">Remove</button>
          </td>
          <td>
          <button type="submit" class="btn btn-primary" id="edit" data-key="${key}">Update</button>
          </td>
         </tr>
         </tbody>`
    );

    // Change the HTML to reflect
    $("#trainname").text(sv.trainname);
    $("#destination").text(sv.destnation);
    $("#firsttraintime").text(sv.firsttraintime);
    $("#frequency").text(sv.frequency);

    // Handle the errors
}, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

$(document).on("click", ("#remove"), function () {
    keyref = $(this).attr("data-key");
    database.ref().child(keyref).remove();
    window.location.reload();
});

$(document).on("click", ("#edit"), function () {
   
    keyref = $(this).attr("data-key");
    console.log(keyref);

    editTrainKey = keyref;
    database.ref(keyref).once('value').then(function (childSnapshot) {
        $('#trainname').val(childSnapshot.val().trainname);
        $('#destination').val(childSnapshot.val().destnation);
        $('#firsttraintime').val(childSnapshot.val().firsttraintime);
        $('#frequency').val(childSnapshot.val().frequency);
    });

});

function timeUpdater() {
    database.ref().once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        time = moment().format('X');
        database.ref(childSnapshot.key).update({
        currenttime: time,
        })
      })    
    });
  };

  setInterval(timeUpdater, 10000);

  
setInterval(function () {
    window.location.reload();
}, 60000);


