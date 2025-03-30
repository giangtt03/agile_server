const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const corsOptions = {
    origin: "*", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization"
  };
  app.use(cors(corsOptions));
  
// app.use(cors());

const port = 3000;
dotenv.config();

app.use(session({
    secret: 'TjLaGZD2irGKix0g7r+t7w==',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('Db connected')
}).catch((err)=> console.log(err));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

app.use(morgan('dev'));

app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routes adminstrator
const authRouter = require('./routes/auth');
const categoryRouter = require('./routes/category');
const questionRouter = require('./routes/question');
const testRouter = require('./routes/test');

app.use('/', authRouter);
app.use('/category', categoryRouter);
app.use('/question', questionRouter);
app.use('/test', testRouter);

//api
const apiAuthRouter = require('./routes/api/api.auth');
const apiTestRouter = require('./routes/api/api.testt');

app.use('/api', apiAuthRouter);
app.use('/api/quizz', apiTestRouter);

app.listen(process.env.PORT || port, () => console.log(`Server listening on port ${process.env.PORT}!`));