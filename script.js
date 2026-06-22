// currently selected role on signup page
var selectedRole = "freelancer";

// switch role button when clicked
function selectRole(role) {

  selectedRole = role;

  var freelancerBtn = document.getElementById("freelancerBtn");
  var clientBtn = document.getElementById("clientBtn");
  var skillsField = document.getElementById("suSkills");

  if (role == "freelancer") {
    freelancerBtn.classList.add("active");
    clientBtn.classList.remove("active");
    skillsField.style.display = "block";
  } else {
    clientBtn.classList.add("active");
    freelancerBtn.classList.remove("active");
    skillsField.style.display = "none";
  }
}

// ========================
// SIGNUP
// ========================

function signupUser() {

  var name = document.getElementById("suName");
  var email = document.getElementById("suEmail");
  var password = document.getElementById("suPassword");
  var skills = document.getElementById("suSkills");
  var errorMsg = document.getElementById("suError");
  var successMsg = document.getElementById("suSuccess");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  // check empty fields
  if (name.value == "" || email.value == "" || password.value == "") {
    errorMsg.textContent = "Please fill in all fields.";
    return;
  }

  // freelancer must add skills
  if (selectedRole == "freelancer" && skills.value == "") {
    errorMsg.textContent = "Please add your skills.";
    return;
  }

  // basic email check
  if (email.value.indexOf("@") == -1) {
    errorMsg.textContent = "Please enter a valid email address.";
    return;
  }

  if (password.value.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters.";
    return;
  }

  // get existing users
  var users = [];
  var saved = localStorage.getItem("users");
  if (saved != null) {
    users = JSON.parse(saved);
  }

  // check duplicate email
  for (var i = 0; i < users.length; i++) {
    if (users[i].email == email.value) {
      errorMsg.textContent = "This email is already registered.";
      return;
    }
  }

  // create new user
  var newUser = {
    id: Date.now(),
    name: name.value,
    email: email.value,
    password: password.value,
    role: selectedRole,
    skills: skills.value,
    bio: "",
    photo: "👤"
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  successMsg.textContent = "Account created! Redirecting to login...";

  setTimeout(function() {
    window.location.href = "login.html";
  }, 1500);
}

// ========================
// LOGIN
// ========================

function loginUser() {

  var email = document.getElementById("loginEmail");
  var password = document.getElementById("loginPassword");
  var errorMsg = document.getElementById("loginError");

  errorMsg.textContent = "";

  if (email.value == "" || password.value == "") {
    errorMsg.textContent = "Please fill in all fields.";
    return;
  }

  var users = [];
  var saved = localStorage.getItem("users");
  if (saved != null) {
    users = JSON.parse(saved);
  }

  var found = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].email == email.value && users[i].password == password.value) {
      found = true;
      localStorage.setItem("loggedInUser", JSON.stringify(users[i]));
      window.location.href = "browse.html";
      break;
    }
  }

  if (!found) {
    errorMsg.textContent = "Incorrect email or password.";
  }
}

// ========================
// LOGOUT (used on other pages)
// ========================

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// ========================
// CHECK LOGIN (used on protected pages)
// ========================

function checkLogin() {
  var loggedIn = localStorage.getItem("loggedInUser");
  if (loggedIn == null) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(loggedIn);
}

// ========================
// POST A GIG
// ========================

// run this when postgig.html loads
var gigTitleField = document.getElementById("gigTitle");

if (gigTitleField != null) {
  var currentUser = checkLogin();
  if (currentUser != null) {
    showMyGigs();
  }
}

function postGig() {

  var title = document.getElementById("gigTitle").value.trim();
  var category = document.getElementById("gigCategory").value;
  var desc = document.getElementById("gigDesc").value.trim();
  var price = document.getElementById("gigPrice").value.trim();
  var errorMsg = document.getElementById("gigError");
  var successMsg = document.getElementById("gigSuccess");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  // check empty fields
  if (title == "" || category == "" || desc == "" || price == "") {
    errorMsg.textContent = "Please fill in all fields.";
    return;
  }

  if (price <= 0) {
    errorMsg.textContent = "Price must be more than 0.";
    return;
  }

  var user = checkLogin();
  if (user == null) return;

  // get existing gigs
  var gigs = [];
  var saved = localStorage.getItem("gigs");
  if (saved != null) {
    gigs = JSON.parse(saved);
  }

  // create new gig object
  var newGig = {
    id: Date.now(),
    title: title,
    category: category,
    desc: desc,
    price: price,
    freelancerId: user.id,
    freelancerName: user.name
  };

  gigs.push(newGig);
  localStorage.setItem("gigs", JSON.stringify(gigs));

  successMsg.textContent = "Gig posted successfully!";

  // clear form
  document.getElementById("gigTitle").value = "";
  document.getElementById("gigCategory").value = "";
  document.getElementById("gigDesc").value = "";
  document.getElementById("gigPrice").value = "";

  showMyGigs();
}

// show gigs posted by the logged in freelancer
function showMyGigs() {

  var user = checkLogin();
  if (user == null) return;

  var list = document.getElementById("myGigsList");
  if (list == null) return;

  var gigs = [];
  var saved = localStorage.getItem("gigs");
  if (saved != null) {
    gigs = JSON.parse(saved);
  }

  // filter only this user's gigs
  var myGigs = [];
  for (var i = 0; i < gigs.length; i++) {
    if (gigs[i].freelancerId == user.id) {
      myGigs.push(gigs[i]);
    }
  }

  list.innerHTML = "";

  if (myGigs.length == 0) {
    list.innerHTML = "<p class='empty-msg'>You haven't posted any gigs yet.</p>";
    return;
  }

  for (var j = 0; j < myGigs.length; j++) {

    var gig = myGigs[j];
    var card = document.createElement("div");
    card.className = "gig-card";

    card.innerHTML =
      "<div class='gig-card-left'>" +
        "<h3>" + gig.title + "</h3>" +
        "<p>" + gig.category + "</p>" +
      "</div>" +
      "<div class='gig-card-price'>₹" + gig.price + "</div>" +
      "<button class='gig-del-btn' onclick='deleteGig(" + gig.id + ")'>Delete</button>";

    list.appendChild(card);
  }
}

// delete a gig
function deleteGig(id) {

  var gigs = [];
  var saved = localStorage.getItem("gigs");
  if (saved != null) {
    gigs = JSON.parse(saved);
  }

  var newList = [];
  for (var i = 0; i < gigs.length; i++) {
    if (gigs[i].id != id) {
      newList.push(gigs[i]);
    }
  }

  localStorage.setItem("gigs", JSON.stringify(newList));
  showMyGigs();
}

// ========================
// BROWSE GIGS
// ========================

// run this when browse.html loads
var gigsGrid = document.getElementById("gigsGrid");

if (gigsGrid != null) {
  var browseUser = checkLogin();
  if (browseUser != null) {
    filterGigs();
  }
}

// get all gigs and show them, applying search + filter
function filterGigs() {

  var searchBox = document.getElementById("searchInput");
  var categoryBox = document.getElementById("filterCategory");

  var query = searchBox.value.toLowerCase();
  var category = categoryBox.value;

  var gigs = [];
  var saved = localStorage.getItem("gigs");
  if (saved != null) {
    gigs = JSON.parse(saved);
  }

  // apply filters
  var filtered = [];

  for (var i = 0; i < gigs.length; i++) {

    var titleMatch = gigs[i].title.toLowerCase().indexOf(query) != -1;
    var categoryMatch = (category == "All" || gigs[i].category == category);

    if (titleMatch && categoryMatch) {
      filtered.push(gigs[i]);
    }
  }

  renderGigsGrid(filtered);
}

// draw the gig cards on screen
function renderGigsGrid(list) {

  var grid = document.getElementById("gigsGrid");
  var noGigsMsg = document.getElementById("noGigsMsg");

  grid.innerHTML = "";

  if (list.length == 0) {
    noGigsMsg.style.display = "block";
    return;
  }

  noGigsMsg.style.display = "none";

  for (var i = 0; i < list.length; i++) {

    var gig = list[i];
    var card = document.createElement("div");
    card.className = "browse-card";
    card.onclick = function() {
      var gigId = this.getAttribute("data-id");
      window.location.href = "profile.html?freelancerId=" + this.getAttribute("data-freelancer");
    };

    card.setAttribute("data-id", gig.id);
    card.setAttribute("data-freelancer", gig.freelancerId);

    // short description preview
    var shortDesc = gig.desc;
    if (shortDesc.length > 70) {
      shortDesc = shortDesc.substring(0, 70) + "...";
    }

    card.innerHTML =
      "<span class='cat-tag'>" + gig.category + "</span>" +
      "<h3>" + gig.title + "</h3>" +
      "<p class='gig-desc-preview'>" + shortDesc + "</p>" +
      "<div class='browse-card-footer'>" +
        "<span class='by-name'>by " + gig.freelancerName + "</span>" +
        "<span class='price-tag'>₹" + gig.price + "</span>" +
      "</div>";

    grid.appendChild(card);
  }
}

// ========================
// FREELANCER PROFILE PAGE
// ========================

// id of freelancer currently being viewed
var viewingFreelancerId = null;

// run this when profile.html loads
var profNameEl = document.getElementById("profName");

if (profNameEl != null) {

  var profileUser = checkLogin();

  if (profileUser != null) {

    // get freelancerId from the URL
    var urlParams = new URLSearchParams(window.location.search);
    viewingFreelancerId = urlParams.get("freelancerId");

    loadFreelancerProfile();
    setupStarInput();
  }
}

// load and show the freelancer's details
function loadFreelancerProfile() {

  var users = [];
  var saved = localStorage.getItem("users");
  if (saved != null) {
    users = JSON.parse(saved);
  }

  var freelancer = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].id == viewingFreelancerId) {
      freelancer = users[i];
    }
  }

  if (freelancer == null) {
    document.getElementById("profName").textContent = "Freelancer not found";
    return;
  }

  document.getElementById("profName").textContent = freelancer.name;
  document.getElementById("profSkills").textContent = freelancer.skills;

  if (freelancer.bio != "") {
    document.getElementById("profBio").textContent = freelancer.bio;
  }

  loadFreelancerGigs();
  loadFreelancerReviews();
}

// show all gigs by this freelancer
function loadFreelancerGigs() {

  var gigs = [];
  var saved = localStorage.getItem("gigs");
  if (saved != null) {
    gigs = JSON.parse(saved);
  }

  var myGigs = [];
  for (var i = 0; i < gigs.length; i++) {
    if (gigs[i].freelancerId == viewingFreelancerId) {
      myGigs.push(gigs[i]);
    }
  }

  var list = document.getElementById("profGigsList");
  list.innerHTML = "";

  if (myGigs.length == 0) {
    list.innerHTML = "<p class='empty-msg'>No gigs posted yet.</p>";
    return;
  }

  for (var j = 0; j < myGigs.length; j++) {

    var gig = myGigs[j];
    var card = document.createElement("div");
    card.className = "browse-card";

    card.innerHTML =
      "<span class='cat-tag'>" + gig.category + "</span>" +
      "<h3>" + gig.title + "</h3>" +
      "<p class='gig-desc-preview'>" + gig.desc + "</p>" +
      "<div class='browse-card-footer'>" +
        "<span class='price-tag'>₹" + gig.price + "</span>" +
      "</div>";

    list.appendChild(card);
  }
}

// show reviews for this freelancer and calculate average rating
function loadFreelancerReviews() {

  var reviews = [];
  var saved = localStorage.getItem("reviews");
  if (saved != null) {
    reviews = JSON.parse(saved);
  }

  var myReviews = [];
  for (var i = 0; i < reviews.length; i++) {
    if (reviews[i].freelancerId == viewingFreelancerId) {
      myReviews.push(reviews[i]);
    }
  }

  var list = document.getElementById("profReviewsList");
  list.innerHTML = "";

  if (myReviews.length == 0) {
    list.innerHTML = "<p class='empty-msg'>No reviews yet.</p>";
  } else {

    var totalStars = 0;

    for (var j = 0; j < myReviews.length; j++) {

      var rev = myReviews[j];
      totalStars = totalStars + rev.rating;

      var card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML =
        "<div class='review-stars'>" + getStarString(rev.rating) + "</div>" +
        "<div class='review-author'>by " + rev.clientName + "</div>" +
        "<div class='review-text'>" + rev.text + "</div>";

      list.appendChild(card);
    }

    // update star summary at top
    var avg = totalStars / myReviews.length;
    document.getElementById("profStars").textContent = getStarString(Math.round(avg));
    document.getElementById("profRatingText").textContent = avg.toFixed(1) + " (" + myReviews.length + " reviews)";
  }
}

// helper to build star string like ★★★☆☆
function getStarString(rating) {
  var stars = "";
  for (var i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars = stars + "★";
    } else {
      stars = stars + "☆";
    }
  }
  return stars;
}

// star rating input click handler
var selectedRating = 0;

function setupStarInput() {

  var starInput = document.getElementById("starInput");
  if (starInput == null) return;

  var stars = starInput.querySelectorAll("span");

  for (var i = 0; i < stars.length; i++) {
    stars[i].onclick = function() {
      selectedRating = parseInt(this.getAttribute("data-val"));
      highlightStars(selectedRating);
    };
  }
}

function highlightStars(rating) {
  var stars = document.querySelectorAll("#starInput span");
  for (var i = 0; i < stars.length; i++) {
    var val = parseInt(stars[i].getAttribute("data-val"));
    if (val <= rating) {
      stars[i].classList.add("filled");
      stars[i].textContent = "★";
    } else {
      stars[i].classList.remove("filled");
      stars[i].textContent = "☆";
    }
  }
}

// submit a new review
function submitReview() {

  var text = document.getElementById("reviewText").value.trim();
  var msg = document.getElementById("reviewMsg");

  if (selectedRating == 0) {
    msg.style.color = "#ff4444";
    msg.textContent = "Please select a star rating.";
    return;
  }

  if (text == "") {
    msg.style.color = "#ff4444";
    msg.textContent = "Please write a review.";
    return;
  }

  var user = checkLogin();
  if (user == null) return;

  var reviews = [];
  var saved = localStorage.getItem("reviews");
  if (saved != null) {
    reviews = JSON.parse(saved);
  }

  var newReview = {
    id: Date.now(),
    freelancerId: viewingFreelancerId,
    clientName: user.name,
    rating: selectedRating,
    text: text
  };

  reviews.push(newReview);
  localStorage.setItem("reviews", JSON.stringify(reviews));

  msg.style.color = "#22c55e";
  msg.textContent = "Review submitted!";

  document.getElementById("reviewText").value = "";
  selectedRating = 0;
  highlightStars(0);

  loadFreelancerReviews();
}

// ========================
// QUICK MESSAGE POPUP (from profile page)
// ========================

function openMessageBox() {
  document.getElementById("msgOverlay").classList.add("show");
}

function closeMessageBox() {
  document.getElementById("msgOverlay").classList.remove("show");
  document.getElementById("quickMsgText").value = "";
}

function sendQuickMessage() {

  var text = document.getElementById("quickMsgText").value.trim();
  if (text == "") return;

  var user = checkLogin();
  if (user == null) return;

  // get all chats
  var chats = [];
  var saved = localStorage.getItem("chats");
  if (saved != null) {
    chats = JSON.parse(saved);
  }

  // create a unique chat id based on both user ids (sorted so it's always the same)
  var ids = [user.id, parseInt(viewingFreelancerId)].sort();
  var chatId = ids[0] + "_" + ids[1];

  // find existing chat or create new one
  var chat = null;
  for (var i = 0; i < chats.length; i++) {
    if (chats[i].chatId == chatId) {
      chat = chats[i];
    }
  }

  if (chat == null) {
    chat = {
      chatId: chatId,
      userA: ids[0],
      userB: ids[1],
      messages: []
    };
    chats.push(chat);
  }

  chat.messages.push({
    senderId: user.id,
    senderName: user.name,
    text: text,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("chats", JSON.stringify(chats));

  closeMessageBox();
  window.location.href = "messages.html?chatId=" + chatId;
}
