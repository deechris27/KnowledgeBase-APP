const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

//Bring in user Model
let User = require('../models/user');

//Register form
router.get('/register', function(req, res){
  res.render('register', {title: 'Register Here'});
});

//Resgister submitted
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.confirmpassword;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Confirm-Password is required').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  }else{
    let newUser = User({
      name: name,
      email: email,
      username: username,
      password: password,
    });
  }

   bcrypt.genSalt(10, function(err, salt){
     bcrypt.hash(newUser.password, salt, function(err, hash){
       if(err){
         console.log(err);
       }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }else{
            req.flash('You are now registered');
            res.redirect('/users/login');
          }
        });
     });
   });

});

router.get('/login', function(req, res){
  res.render('login');
});

module.exports = router;