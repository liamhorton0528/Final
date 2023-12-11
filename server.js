import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import {body, validationResult} from 'express-validator';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(express.urlencoded());
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: "Humber",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

mongoose.connect('mongodb+srv://liamhorton:finalpassword@finalproject.nis6k07.mongodb.net/Final', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await User.findOne({username: username});
        console.log(user);
        if(!user || !bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Incorrect username or password'});
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err);
    });
});

const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/login');
    }
};

const userSchema = new mongoose.Schema({
    username: String,
    password: String
}, {collection: 'Users'});

const workSchema = new mongoose.Schema({
    name: String,
    dueDate: Date,
    posted_by: mongoose.Schema.Types.ObjectId,
    description: String
}, {collection: 'Work'})

const completedSchema = new mongoose.Schema({
    name: String,
    completed: Date,
    posted_by: mongoose.Schema.Types.ObjectId
}, {collection: 'Complete'})

const User = mongoose.model('User', userSchema);
const Work = mongoose.model('Work', workSchema);
const Completed = mongoose.model('Complete', completedSchema);

app.use((req,res,next) =>{
    console.log(`${req.method} request for ${req.url}`);
    next();
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({username: req.body.username, password: hashedPassword});
        await newUser.save();
        res.redirect('/login');
    }
    catch(error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureMessage: true, successMessage: true}), (req, res) => {
    const token = jwt.sign({id: req.user.id}, 'SECRET', {expiresIn: '1h'});
    res.header('Authorization', `Bearer ${token}`);
    res.redirect('/');
})

app.post('/logout', (req, res) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        res.redirect('/');
    })
})

app.get('/', (req, res) => {
    res.render('home.ejs', {user: req.user});
})

//GET all work to be done
 app.get('/work', ensureAuthenticated, async (req, res) => {
    try {
        const work = await Work.find({"posted_by": req.user._id});
        res.render('work.ejs', {work: work, user: req.user});
    }
    catch(err) {
        console.log(err)
        res.status(500).send('Error fetching users from database');
    }
})

//add work
app.post('/work/add', ensureAuthenticated, async (req, res) => {
    try {
        const newWork = new Work({name: req.body.name, dueDate: req.body.dueDate, posted_by: req.user._id, description: req.body.description});
        const result = await newWork.save();
        console.log("Work saved to database: ", result);
        res.redirect('/work');
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Error saving work to database');
    }
})

//delete work
app.post('/work/delete', ensureAuthenticated, async (req, res) => {
    try {
        const workID = req.body.id;
        const doc = await Work.findById(workID);
        await doc.deleteOne();
        res.redirect('/work')
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Error deleting work.');
    }
})

app.get('/complete', ensureAuthenticated, async (req, res) => {
    try {
        const completed = await Completed.find({"posted_by": req.user._id});
        res.render('completed.ejs', {completed: completed, user: req.user});
    }
    catch(err) {
        console.log(err)
        res.status(500).send('Error fetching completed work from database');
    }
})

//mark work completed and store elsewhere
app.post('/complete/add', async (req, res) => {
    try {
        const work = await Work.findById(req.body.id);
        const newCompleted = new Completed({name: work.name, completed: Date.now(), posted_by: work.posted_by});
        const result = await newCompleted.save();
        await work.deleteOne();
        console.log("Completed work saved to database: ", result);
        res.redirect('/work');
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Error deleting work.');
    }
})

//delete completed work
app.post('/complete/delete', async (req, res) => {
    try {
        const completedID = req.body.id;
        const doc = await Completed.findById(completedID);
        await doc.deleteOne();
        res.redirect('/complete');
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Error deleting work.');
    }
})


//creating server
app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}/`);
})