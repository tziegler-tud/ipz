var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");
var app = express();

const UserManager = require("../services/userManager");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



const webpush = require('web-push');
// VAPID keys should only be generated only once. we've run the vapid.js file to do this.
var vapidPublicKey = "BM-VsybJ1S9bkhK-GLK_LoxozsJdr0PfQCS6dmqVcpe08oSZthKcGw3Pws4D_PI4ahyxoArS6TuWYSZwW1m1nQo";
var vapidPrivateKey = "S4B8s1x437nt6Rbo2E0t4uXo1zyacvxAoexd9i1Dbfk"

webpush.setVapidDetails(
    'mailto:test@ipzdd.de',
    vapidPublicKey,
    vapidPrivateKey
);

/*
hoked at /
* */


router.post('/push/:id', function(req, res, next) {
  // send push to user with id. This only works if the user is active.

  // var options = {
  //   TTL: 24 * 60 * 60,
  //   vapidDetails: {
  //     subject: 'mailto:damian@bocajs.com',
  //     publicKey: vapidPublicKey,
  //     privateKey: vapidPrivateKey
  //   }
  // };
    var options = {
        TTL: 24 * 60 * 60,
        vapidDetails: {
                subject: 'mailto:test@ipzdd.de',
                publicKey: vapidPublicKey,
                privateKey: vapidPrivateKey
              }
    }
  var message = "Shhht - Private Message from user " + req.user.name + "!";
    let title = "Hello there!"
  // Find the active user
  UserManager.getActiveUserById(req.params.id)
      .then(function(userObj){
        let sub = userObj.subscription;
        if (sub === undefined || sub === null) {
          next(new Error("Failed to notify user: user has no active PushSubscription"));
        }
        // Code here.
        let pushSubscription = {
          "endpoint":sub.endpoint,
          "keys": {
            "p256dh":sub.token,
            "auth": sub.auth
          } // end keys
        }; // end pushSubscription

          let payload = {
              message: {
                  body: message,
                  title: title,
              },
              data: {
                  testData: {
                      a: "string",
                      b: 123,
                      c: false,
                  }
              }
          }

        // MAGIC!
        webpush.sendNotification(pushSubscription,JSON.stringify(payload));
        console.log("notification sent to user " + userObj.user.username);

        res.end( "notification sent");
      })
});

router.get('/push/all', function(req, res, next) {
  // Let ALL browsers pop up a message
  // console.log(" We've been notified. Now send notification to all browsers");

  var options = {
    TTL: 24 * 60 * 60,
    vapidDetails: {
      subject: 'mailto:damian@bocajs.com',
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey
    }
  };
  var message = "Hello everyone!";

  // Hit each browser that registered with us.
  UserManager.getConnectedUsers()
      .then(function(activeUser){
        activeUser.forEach(function(userObj){
          if (userObj.subscription !== undefined) {
            let sub = userObj.subscription;
            // Code here.
            let pushSubscription = {
                "endpoint":sub.endpoint,
                "keys": {
                    "p256dh":sub.token,
                    "auth": sub.auth
                } // end keys
            }; // end pushSubscription

            // MAGIC!
            webpush.sendNotification(pushSubscription,message);
            console.log(activeUser.length + " notification sent");

            res.end( activeUser.length + " notification sent");
          }
          else {
            console.log("user " + userObj.user.username + " has no active PushSubscription. Skipping.");
          }

        })
      });
});


module.exports = router;