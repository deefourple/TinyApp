//create an array of indexes from each random number and store it everytime with a different variable.
function generateRandomString() {
  let result = "";
  let lengthOfShortUrl = 6;
  let chars = "0123456789abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < lengthOfShortUrl; i++){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function matchUser(email) {
  let returned;
  for (let rand in users) {
    if (email === users[rand].email) {
      returned = users[rand];
      break;
   } else {
      returned = 403;
    }
  }
  return returned;
}

let users = {
//do not remove! database for entire system...
};

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookie = require('cookie-session');
//require morgan
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashed_password = bcrypt.hashSync(password, 10);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(cookie({
  name: 'session',
  keys: ['key1', 'key2']
}))

let urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

let pageVisits = 0;

app.get("/", function(request, response) {
  pageVisits += 1;
  let login = { info: users[request.session.user_id],
                pageVisits: pageVisits };
  response.render('urls_home.ejs', login)
});

app.get('/register', function(request, response){
  let login = { info: users[request.session.user_id] };
  response.render('urls_register', login)
});

app.post('/register', function(request, response){
  // if someone tries to register with an existing user's email,
  // send back a response with the 400 status code
  for (var rand in users) {
    //check already stored rand["email"] in users for a match
    if (users[rand].email === request.body.email) {
      response.status(400);
      response.send("Sorry, the username you have selected already exists", response.statusCode);
    }
  }
  if (request.body.email === "" || request.body.password === "") {
    response.status(400)
    response.send("Sorry, you have not input enough information", response.statusCode);
  } else {
    const random = generateRandomString();
    let hashedPassword = bcrypt.hashSync(request.body.password, 10)
    users[random] = {
      id: random,
      email: request.body.email,
      password: hashedPassword,
      database: {}
    }
    request.session.user_id = random;
    response.redirect("/urls")
  }
});

app.get('/login', function(request, response) {
    let login = {  info: users[request.session.user_id] };
    response.render('urls_login', login)
});

app.post("/login", function(request, response){
  let matchedUser =  matchUser(request.body.email);
  if (matchedUser === 403 || matchedUser === undefined) {
    response.status(403)
    response.send("Sorry but your email didn't not match an registered account")
  } else {
      if (bcrypt.compareSync(request.body.password, matchedUser.password)) {
      request.session.user_id = matchedUser.id;
      response.redirect('/urls')
      } else {
    response.status(403)
    response.send("Sorry but your password didn't match a registered account")
      }
  }
});

app.get("/urls", function(request, response) {
  if(request.session.user_id){
  let locals = { urls: users[request.session.user_id].database,
                 user_id: request.session.email,
                 info: users[request.session.user_id]
             };
  response.render("urls_index", locals);
  } else {
    response.status(401)
    response.send("You must be logged in to view this page")
    response.send("To go back to the home page, click here ->" + "<a href="/"> </a>")
  }
});

app.post("/urls", function(request, response) {
  if (request.session.user_id){
    let generatedCode = generateRandomString();
    if (request.body.longURL.slice(0, 7) === "http://" || request.body.longURL.slice(0, 8) === "https://"){
      urlDatabase[generatedCode] = request.body.longURL;
      users[request.session.user_id].database[generatedCode] = request.body.longURL;
      response.redirect("/urls/" + generatedCode);
    } else {
      urlDatabase[generatedCode] = "http://" + request.body.longURL;
      users[request.session.user_id].database[generatedCode] = "http://" + request.body.longURL;
      response.redirect("/urls/" + generatedCode);
    }
  } else {
    response.status(401);
    response.send("Sorry, you cannot shorten URLs without being logged in")
  }
});

//because the cookie lives in the browser when you restart the server the cookie is still set
//show that user is already logged in if cookie exists
app.get("/urls/new", function(request, response) {
  let login = { username: request.session.username,
                info: users[request.session.user_id]
              };
  response.render("urls_new", login);
});


app.get("/urls/:id", function(request, response) {
  let locals = { shortURL: request.params.id,
                 longUrls: urlDatabase,
                  info: users[request.session.user_id]
               };
  response.render("urls_show", locals);
});

app.get("/u/:shortURL", (request, response) => {
  let randomCode = request.params.shortURL;
  let longURL = users[request.session.user_id].database[randomCode]
  response.redirect(longURL);
});

app.post("/urls/:id/delete", function(request, response){
  delete users[request.session.user_id].database[request.params.id]
  response.redirect("/urls/")
});

app.post("/:id/update", function(request,response){
  if (request.body.updateLongURL.slice(0, 7) === "http://" || request.body.updateLongURL.slice(0, 8) === "https://"){
    urlDatabase[request.params.id] = request.body.updateLongURL;
    users[request.session.user_id].database[request.params.id] = request.body.updateLongURL;
  } else {
    urlDatabase[request.params.id] = "http://" + request.body.updateLongURL;
    users[request.session.user_id].database[request.params.id] = "http://" + request.body.updateLongURL;
  }
  response.redirect('/urls')
})

app.post("/logout", function(request, response){
  request.session = null;
  response.redirect('/');
});


app.listen(PORT, function() {
  console.log(`Example app listening on port: ${PORT}!`);
});
