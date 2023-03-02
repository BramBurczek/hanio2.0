const express = require("express");
const cookieParser = require('cookie-parser')


const app = express();


app.use(express.static(__dirname + '/'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const mongoose = require("mongoose")
mongoose.set('strictQuery', false);


const User = require("./User");
const { name } = require("ejs");

mongoose.connect("mongodb://localhost/userdb", () => {
  console.log("conncected")
},
e => console.error(e)
)

const session = require('express-session')

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const methodOverride = require('method-override')

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(cookieParser('process.env.SESSION_SECRET'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie : {
    expires: false,
    }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

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

app.get('/', checkAuthenticated,(req, res, next) => {
  User.find({}).sort({score: -1}).limit(5).exec(function (err, entries) {
    let userQuery = global.globalusername;
    if (err) {
        res.send('Error fetching leaderboard entries from the database.');
    } else {  
      res.render('index.ejs', {entries: entries, user: userQuery});
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
  failureRedirect: '/login',
  failureFlash: true,
  session: true
}),
function(req, res) {
  globalThis.globalusername = req.user.name;
  res.redirect('/?username='+req.user.name);
});


app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})


app.get('/mehr', function(req, res) {
  res.render('mehr.ejs');
});


app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({ id: Date.now().toString(), name: req.body.name, email: req.body.email, password: hashedPassword, score: 0})
    await user.save()
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.put('/', async (req, res) => {
  try {
      const userId = globalThis.globalusername
      User.findOneAndUpdate({ name: userId },{ $inc: { score: 1 }},{
        new: true
      }, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          console.log(user);
        }
      })

      res.status(200).json({ message: 'User score updated' });

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/logout', function(req, res, next) {
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


