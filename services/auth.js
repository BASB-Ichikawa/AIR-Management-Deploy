var localStrategy = require('passport-local').Strategy;
var session = require('express-session');
var request = require('request');
var constants = require('../utilities/constants');

exports.init = async (app, passport) => {

    function execute() {
        return new Promise(resolve => {
            app.use(passport.initialize());

            let isComplated = false;
            passport.use(
                new localStrategy(
                    {	
                        usernameField: 'email', 
                        passwordField: 'password'
                    },
                    (username, password, done) => {

                        request.post({
                            url: constants.AUTH_API_URL,
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({ email: username, password: password })
                        }, (error, response, body) => {
                            if(error) {
                                done(null, false);
                            }

                            if(response.statusCode === 200) {
                                done(null, JSON.parse(body).userName);
                            } else {
                                done(null, false);
                            }

                            isComplated = true;
                        });

                    }
                )
            );

            setInterval(() => {
                if(isComplated){　
                  clearInterval();
                }
            }, 1000);

            passport.serializeUser((user, done) => {
                done(null, user);
            });

            passport.deserializeUser((user, done) => {
                done(null, user);
            });

            app.use(session({
                secret: 'air-management',
                resave: false,
                saveUninitialized: false,
                httpOnly: true,
                cookie: { maxAge: 1000 * 60 * 30 } // 30分
            }));

            app.use(passport.session());

            resolve("Complated");
        });
    }

    return await execute();
};

exports.isAuthenticated = (req, res, next) => {
    if (req.session.passport) { // 認証済
        return next();
    } else {
        res.sendStatus(403);
    }
}
