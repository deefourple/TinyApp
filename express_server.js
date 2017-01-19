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

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
//attach 'request.body' to each post/put request
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



app.get("/", function(request, response) {
  response.end("Hello, from Dave");
});

app.get("/urls/new", function(request, response) {
  let login = { username: request.cookies["username"] };
  response.render("urls_new", login);
});

app.post("/urls", function(request, response) {
  let generatedCode = generateRandomString();
    if (request.body.longURL.slice(0, 7) === "http://"){
      console.log(urlDatabase[generatedCode] = request.body.longURL);
    } else {
      urlDatabase[generatedCode] = "http://" + request.body.longURL;
    }
  response.redirect("/urls/" + generatedCode);
});

app.get("/urls", function(request, response) {
  let locals = { urls: urlDatabase,
                 username: request.cookies["username"]};
  response.render("urls_index", locals);
});

app.get("/urls/:id", function(request, response) {
  let locals = { shortURL: request.params.id,
                 longUrls: urlDatabase,
                 username: request.cookies["username"] };
  response.render("urls_show", locals);
});

app.get("/u/:shortURL", (request, response) => {
  let locals = {randomCode: request.params.shortURL};
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
  response.cookie("username", request.body.username)
  response.redirect('/urls')
});

app.post("/logout", function(request, response){
  response.clearCookie("username")
  response.redirect('/urls/')
});

app.get('/register', function(request, response){
  let login = { username: request.cookies["username"] };
  response.render('urls_register', login)
});

let usernames = [
  { },
];
app.post("/register", function(request, response){
  usernames.email = request.body.email;
  usernames.password = request.body.password;
  console.log(usernames);
  response.redirect("/urls/")
});

app.get("/urls.json", function(request, response) {
  response.json(urlDatabase);
});

app.get("/hello", function(request, response) {
  response.end("<html><body>Hello <b>All!</b></body></html>\n");
});

app.listen(PORT, function() {
  console.log(`Example app listening on port: ${PORT}!`);
});