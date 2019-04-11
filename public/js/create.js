var friends = [];
var friendNum = 1;

$(function() {
  $("[data-toggle='tooltip']").tooltip();
});

$(document).on("input", "#nextParagraph", function () {
  var totalChar = $("#nextParagraph").data("chars");

  let invalid = $("#nextParagraphInvalid");
  invalid.attr("class", "invalid-feedback");
  
  $("#charsLeft").text(
    totalChar -
    $("#nextParagraph")
      .val()
      .trim().length
  );
});


$(document).on("click","#return",function(e) {
  e.preventDefault;

  window.location = "/users/stories";
})

$(document).on("click","#submitAddToStory", function(e) {
  e.preventDefault();
  let invalid = $("#nextParagraphInvalid");
  invalid.attr("class", "invalid-feedback");


  if ((parseInt($("#charsLeft").text()) < 0) || ($("#nextParagraph").val().trim() === "")) {

    if (parseInt($("#charsLeft").text()) < 0) {
      invalid.attr("class", "invalid-feedback d-block");
      invalid.text("You put in too many characters.");
    } else {
      invalid.attr("class", "invalid-feedback d-block");
      invalid.text("Your paragraph is blank.");
    }
  } else {

    var newParagraph = {
      content: $("#nextParagraph")
        .val()
        .trim(),
      storyId: $("#nextParagraph").data("id"),
      totalTurns: $("#nextParagraph").data("turns")
    };
  
  
    // Send the POST request.
    $.ajax("/api/addToStory", {
      type: "POST",
      data: newParagraph
    })
      .then(data => {
        location.reload();
      })
      .catch({})
  

  }

  
});



// $(document).on("click", "#submitCreateStory", function (e) {
  $(document).on("submit", "#createStory", function (e) {
  e.preventDefault();


  let invalid = $("#createFirstParagraphInvalid");
  invalid.attr("class", "invalid-feedback");



  if ((parseInt($("#charsLeft").text()) < 0) || ($("#createFirstParagraph").val().trim() === "")) {

    if (parseInt($("#charsLeft").text()) < 0) {
      invalid.attr("class", "invalid-feedback d-block");
      invalid.text("You put in too many characters.");
    } else {
      invalid.attr("class", "invalid-feedback d-block");
      invalid.text("Your paragraph is blank.");
    }
  } else {
    let friend = $("#createStoryFriend" + friendNum);
    if (!emailExists(friend.val().trim()) && friend.val().trim() != "") {
      friends.push(friend.val());
    }
  
    var newStory = {
      title: $("#createTitle")
        .val()
        .trim(),
      totalChar: $("#createTotalCharacters")
        .val()
        .trim(),
      totalTurn: $("#createTotalTurns")
        .val()
        .trim(),
      firstParagraph: $("#createFirstParagraph")
        .val()
        .trim(),
      friends: JSON.stringify(friends)
    };
  
  
    // Send the POST request.
    $.ajax("/api/createStory", {
      type: "POST",
      data: newStory
    })
      .then(data => {
        window.location = "/users/stories"
      })
      .catch({})
  }
})


$(document).on("click", "#addFriend", function (e) {
  e.preventDefault();

  let invalid = $("#createStoryFriendInvalid" + friendNum);
  invalid.attr("class", "invalid-feedback");

  let friend = $("#createStoryFriend" + friendNum);

  if (friend.val().trim() === "") {
    invalid.attr("class", "invalid-feedback d-block");
    invalid.text("Friend's email address cannot be blank");
  } else if (emailExists(friend.val().trim())) {
    invalid.attr("class", "invalid-feedback d-block");
    invalid.text("Email address already used");
  } else {
    friends.push(friend.val());
    friend.prop("readonly", "true");
    $("#addFriend").html("<i class='fas fa-trash-alt'></i>");
    $("#addFriend").attr("class", "btn btn-delete float-right deleteFriend");
    $("#addFriend").data('friendNum', friendNum);
    $("#addFriend").data('friend', friend.val());
    $("#addFriend").attr("id", "");


    friendNum++;
    let newFriend = `<div class="form-group form-inline">
            <label for="storyFriend${friendNum}" class="mr-1">${friendNum}:</label>
            <input type="email" id="createStoryFriend${friendNum}" class="form-control w-75" aria-describedby="Story Friend ${friendNum} eMail Address">
            <div class="invalid-feedback" id="createStoryFriendInvalid${friendNum}">             
            </div>
            <button id="addFriend" class="btn btn-secondary float-right">Add Friend</button>
          </div>`;

    $("#allFriends").append(newFriend);
    $(`#createStoryFriend${friendNum}`).focus();
  }
});

function emailExists(inputEmail) {
  let isDupe = false;

  if (inputEmail === $("#createTitle").data("email")) {  //compare input to user's email address
    isDupe = true;
  } else {
    friends.forEach(function (value) {
      if (value === inputEmail) {
        isDupe = true;
      }
    });
  }
  return isDupe;
}

$(document).on("click", ".deleteFriend", function (e) {
  e.preventDefault();

  let friendNum = $(this).data('friendNum');
  $(this)
    .parent()
    .remove();

  let friendsTemp = [];
  friends.forEach(function (value) {
    if (value !== $(this).data("friend")) {
      friendsTemp.push(value);
    }

    friends = friendsTemp;
  })
})


$(document).on("input", "#createTotalCharacters", function () {
  var totalChar = $("#createTotalCharacters")
    .val()
    .trim();
  var validNum = false;

  $("#createFirstParagraphInvalid").attr("class", "invalid-feedback");

  var invalid = $("#createTotalCharactersInvalid");
  invalid.attr("class", "invalid-feedback");


  if (!isNaN(totalChar)) {
    var charNum = parseFloat(totalChar);
    if (Number.isInteger(charNum)) {
      if (charNum > 0 && charNum < 1000) {
        validNum = true;
      }
    }
  }

  if (!validNum) {
    invalid.attr("class", "invalid-feedback d-block");
    invalid.text("Numbers between 1 and 1000");
  } else {
    $("#charsLeft").text(
      charNum -
      $("#createFirstParagraph")
        .val()
        .trim().length
    );
  }
});


$(document).on("input", "#createFirstParagraph", function () {
  var totalChar = $("#createTotalCharacters")
    .val()
    .trim();

  $("#charsLeft").text(
    totalChar -
    $("#createFirstParagraph")
      .val()
      .trim().length
  );
});


$(document).on("input", "#createTotalTurns", function () {
  var totalTurn = $("#createTotalTurns")
    .val()
    .trim();
  var validNum = false;

  var invalid = $("#createTotalTurnsInvalid");
  invalid.attr("class", "invalid-feedback");

  if (!isNaN(totalTurn)) {
    var charNum = parseFloat(totalTurn);
    if (Number.isInteger(charNum)) {
      if (charNum > 0 && charNum < 11) {
        validNum = true;
      }
    }
  }

  if (!validNum) {
    invalid.attr("class", "invalid-feedback d-block");
    invalid.text("Numbers between 1 and 10");
  }
});
