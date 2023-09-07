const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

const Thought = require('./models/Thought')
const User = require('./models/User')

const thoughtsRoutes = require('./routes/thoughtsRoutes')
const ThoughtsController = require('./controllers/ThoughtsController')

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () { },
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httpOnly: true
    }
  })
)

app.use(flash())

app.use(express.static('public'))

app.use((req, res, next) => {
  if (req.session.userid) {
    req.locals.session = req.session
  }
  next()
})

app.use('/thoughts', thoughtsRoutes)

app.get('/', ThoughtsController.showThoughts)

conn
  //.sync({ force: true })
  .sync()
  .then(() => {
    app.listen(3000)
  })
  .catch((err) => console.log(err))