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



const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
//require morgan
//require bcrypt

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(cookie())

let urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};


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
  // if the email or password are empty, send back a response with the 400 status code
  if (request.body.email === "" || request.body.password === "") {
    response.status(400)
    response.send("Sorry, you have not input enough information", response.statusCode);
  } else {
    const random = generateRandomString();
    users[random] = {
      id: random,
      email: request.body.email,
      password: request.body.password
    }
    response.cookie("user_id", random)
    response.redirect("/urls")
    // console.log(users);
  }
});

app.get("/", function(request, response) {
  response.end("Hello, from Dave");
});

app.get("/urls/new", function(request, response) {
  let login = { username: request.cookies["username"],
                info: users[request.cookies["user_id"]]
              };
  response.render("urls_new", login);
});

app.post("/urls", function(request, response) {
  if (request.cookies["user_id"]){
  let generatedCode = generateRandomString();
    if (request.body.longURL.slice(0, 7) === "http://"){
      urlDatabase[generatedCode] = request.body.longURL;
      response.redirect("/urls/" + generatedCode);
    } else {
      urlDatabase[generatedCode] = "http://" + request.body.longURL;
      response.redirect("/urls/" + generatedCode);
    }
  } else {
    response.status(401)
    response.send("Sorry, you cannot shorten URLs without being logged in")
  }
});
//because the cookie lives in the browser when you restart the server the cookie is still set
//show that user is already logged in if cookie exists
//on first page

app.get("/urls", function(request, response) {
  if(request.cookies["user_id"]){
  let locals = { urls: urlDatabase,
                 user_id: request.cookies["email"],
                 info: users[request.cookies["user_id"]]
             };
  response.render("urls_index", locals);
  } else {
    response.status(401)
    response.send("You must be logged in to view this page")
  }
});

app.get("/urls/:id", function(request, response) {
  let locals = { shortURL: request.params.id,
                 longUrls: urlDatabase,
                  info: users[request.cookies["user_id"]]
               };
  response.render("urls_show", locals);
});

app.get("/u/:shortURL", (request, response) => {
  let locals = {randomCode: request.params.shortURL
                };
  let longURL = urlDatabase[locals.randomCode];
  response.redirect(longURL);
});

app.post("/urls/:id/delete", function(request, response){
  delete urlDatabase[request.params.id]
  response.redirect("/urls/")
})

app.post("/:id/update", function(request,response){
  if (request.body.updateLongURL.slice(0, 7) === "http://"){
    urlDatabase[request.params.id] = request.body.updateLongURL;
  } else {
    urlDatabase[request.params.id] = "http://" + request.body.updateLongURL;
  }
  response.redirect('/urls')
})

app.post("/login", function(request, response){
  let matchedUser =  matchUser(request.body.email);
  if (matchedUser === 403) {
    response.status(matchedUser)
    response.send("Sorry but your email didn't not match an registered account")
  } else {
      if (matchedUser.password === request.body.password){
      response.cookie("user_id", matchedUser.id)
      response.redirect('/urls')
      } else {
    response.status(403)
    response.send("Sorry but your password didn't match a registered account")
      }
  }
});

app.post("/logout", function(request, response){
  response.clearCookie("user_id")
  response.redirect('/urls/')
});

app.get('/register', function(request, response){
  let login = { info: users[request.cookies["user_id"]]
                };
  response.render('urls_register', login)
});

app.get('/login', function(request, response) {
    let login = {  info: users[request.cookies["user_id"]]
                 };
    response.render('urls_login', login)
});

let users = {

};


app.get("/hello", function(request, response) {
  response.end("<html><body>Hello <b>All!</b></body></html>\n");
});

app.listen(PORT, function() {
  console.log(`Example app listening on port: ${PORT}!`);
});