const express = require("express");
const app = express();

app.use(express.static(__dirname + '/'));

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const mongoose = require("mongoose")
mongoose.set('strictQuery', false);


const User = require("./User");
const { name } = require("ejs");

mongoose.connect("mongodb://localhost/userdb", () => {
  console.log("conncected")
},
e => console.error(e)
)


const LocalStrategy = require('passport-local').Strategy

const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({email: email}).exec();
    if (user == null) {
      return done(null, false, { message: 'Nutzer mit dieser Mail nicht vorhanden' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Passwort falsch' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, User.findOne({id: id}))
  })

//-----------hier noch machen--------
// module.export = {
//   updateScore: function(idUser){
//   User.findOneAndUpdate({id: idUser}, {$inc: {score: 1}}, {new: true}, function(err, doc) {
//     if (err) {
//         console.log("Something wrong when updating data!");
//     }
//     console.log(doc);
//   })
// }
// }




app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated,(req, res, next) => {
  User.find({}).sort({score: -1}).limit(10).exec(function (err, entries) {
    if (err) {
        res.send('Error fetching leaderboard entries from the database.');
    } else {  
        res.locals.currentUser = req.user;
        console.log(res.locals.currentUser)
        res.render('index.ejs', {entries: entries, user: req.user});
    }
});
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.get('/index', checkNotAuthenticated, (req, res) => {
        res.render('index.ejs');
})


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  session: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({ id: Date.now().toString(), name: req.body.name, email: req.body.email, password: hashedPassword })
    await user.save()
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})






app.delete('/logout', function(req, res, next) {
  console.log(req.user)
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)


