const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer=require('nodemailer');
// const mailchimp=require('@mailchimp/mailchimp_transactional')('9dc2114eec668227004973c953a57386')
exports.getLogin = (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage:message
    });
};
exports.postLogin = (req, res, next) => {
    // req.isLoggedIn=true;
    // res.setHeader('Set-Cookie', 'loggedIn=true');
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
            req.flash('error', 'invalid email');
          return res.redirect('/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            req.flash('error', 'Invalid Password');
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
}
exports.getSignup = (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage:message
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'email Already Exists')
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    // const message = {
                    //     from_email: "shop@node-complete.com",
                    //     subject: "Signup Success!",
                    //     text: "Signup Successful!",
                    //     to: [
                    //       {
                    //         email: email,
                    //         type: "to"
                    //       }
                    //     ]
                    //   }
                    //   async function run() {
                    //     const response = await mailchimp.messages.send({
                    //       message
                    //     });
                    //     console.log(response);
                    //   }
                    //   run();
                    res.redirect('/login');
                })
                ;

        })
        .catch(err => console.log(err))


};
exports.getReset=(req, res, next)=>{
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/reset', {
        path:'/reset',
        pageTitle:'Reset Password',
        errorMessage:message
    })
}