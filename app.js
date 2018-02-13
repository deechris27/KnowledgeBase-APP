const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

let Article = require('./models/article');
mongoose.connect('mongodb://localhost/KnowledgeBaseDB');
let db = mongoose.connection;

//check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

//check for db error
db.on('error', function(err){
  console.log(err);
});

var app = express();

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//public folder for static files
app.use(express.static(path.join(__dirname,'public')));

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
  }
}))

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }else{
      res.render('index',{
        title: 'List of Articles from MongoDB',
        articles: articles
      });
    }
  });
});

//get a single article
app.get('/articles/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article:article
    });
  });
});

//add route
app.get('/articles/add', function(req, res){
  res.render('add_article',{title: '20202020'});
});

//post route
app.post('/articles/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('Author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article', {
      title: 'Add Article',
      errors:errors
    });
  }else{
    let article = new Article();
    article.title = req.body.title;
    article.Author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success','Article Added');
        res.redirect('/');
      }
    });
  }
});

//Load edit form
app.get('/articles/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      article:article
    });
  });
});

//submit update edit
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.Author = req.body.author;
  article.body = req.body.body;
  let query = {_id:req.params.id}
  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success','Article Updated');
      res.redirect('/');
    }
  });
});

//delete request
app.delete('/article/:id', function(req, res){
  let query = {_id:req.params.id}
  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }else{
      res.send('Success');
    }
  });
});


//start server
app.listen(3000, function(){
  console.log('server started on port 3000');
});
