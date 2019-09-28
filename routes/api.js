var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get("/api/userLoggedIn", function(req, res){
    res.status(200).send({loggedIn: (req.user ? true : false)});
});

router.post("/api/login", passport.authenticate('local'), function(req, res){
    console.log(req.user);
    res.status(200).send({success: true});
});

router.get("/api/logout", function(req, res){
    console.log("logout");
    req.logout();
    req.session.destroy(function (err) {
        if (!err) {
            console.log("session destroyed");
            res.status(200).clearCookie('connect.sid', {path: '/'}).json({status: "Success"});
        } else {
            console.log("failed to destroy session");
            res.status(400).json({err: "err"});
        }
    });
});

router.post("/api/createAccount", async function(req, res){
    try {
        // TODO server side validation
        const email = req.body.email;
        const plaintextPassword = req.body.password;
        const emailReceive = (req.body.emailReceive == "") ? email : req.body.emailReceive;
        const phoneNumber = req.body.phoneNumber;

        // use bcrypt
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const hashPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
                if (err) {
                    reject();
                }
                resolve(hash);
            });
        });

        let data =
        {
            email: email,
            password: hashPassword,
            emailReceive: emailReceive,
            phoneNumber: phoneNumber
        };

        // check if email is already taken
        let dbRef = getDBRef();

        let checkForExistingEmail = await dbRef.collection("/Admin/Users/Login").where("email", "==", email).get();
        if ((await checkForExistingEmail.docs).length > 0){
            console.log("User with email: " + email + " already exists!");
            res.status(400).send({err: "Email has already been used. Please choose a different one."});
        } else {
            // save to DB
            
            let userDoc = await dbRef.collection("/Admin/Users/Login").add(data);
            let user = {
                email: email,
                password: hashPassword,
                id: await userDoc.id
            }

            let ret = await new Promise(function(res, rej) {
                req.login(user, function(err, data) {
                  if (err) rej(err);
                  else res(data);
                });
            })
            if (await ret){
                console.log("err");
                return res.status(400).send({err: "Error logging in after creating account."});
            } else {
                console.log(req.user);
                return res.status(200).send({success: true});
            }
        }
    }
    catch(err){
        console.log(err);
        res.status(400).send({err: "Error Creating Account."});
    }
});

let checkIfAuthenticated = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        res.status(401).json({err: "Not authenticated."});
    }
}


/*
    REMINDERS
*/
router.post("/api/addReminder", checkIfAuthenticated, function(req, res){
    let name = req.body.name;
    let eventMonth = parseInt(req.body.eventMonth);
    let eventDay = parseInt(req.body.eventDay);
    let daysBefore = parseInt(req.body.daysBefore);

    // validate data
    if (name == "" || isNaN(eventMonth) || isNaN(eventDay) || isNaN(daysBefore)){
        res.status(400).json({err: "Invalid Data."});
        return;
    }

    let daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (eventMonth > 12 || eventMonth < 1 || eventDay < 1 || eventDay > daysInMonth[eventMonth - 1] ||
        daysBefore < 1 || daysBefore > 90){
        res.status(400).json({err: "Invalid Data."});
        return;
    }

    let data = {
        name: name,
        eventMonth: eventMonth,
        eventDay: eventDay,
        daysBefore: daysBefore
    }

    let id = req.user.id;

    let dbRef = getDBRef();
    let ref = dbRef.collection("/Data/Reminders/" + id).add(data)
    .then(doc => {
        console.log("Reminder added")
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({err: "Error adding reminder."});
    });

});

router.get("/api/getReminders", checkIfAuthenticated, function(req, res){
    let id = req.user.id;

    let dbRef = getDBRef();
    let ref = dbRef.collection("/Data/Reminders/" + id).get()
    .then(qs => {
        let docs = qs.docs;
        docs.sort(remindersCompareFunc).reverse();
        let returnObj = [];
        for (let i = 0 ; i < docs.length; i++){
            returnObj.push({
                id: docs[i].id,
                data: docs[i].data()
            });
        }
        res.status(200).json({data: returnObj})
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({err: "Error getting reminders."});
    });
});

router.post("/api/deleteReminder", checkIfAuthenticated, function(req, res){
    let postID = req.body.id;
    let id = req.user.id;

    let dbRef = getDBRef();
    let deleteDoc = dbRef.collection("/Data/Reminders/" + id).doc(postID).delete()
    .then(writeResult => {
        console.log("reminder deleted");
        res.status('200').send({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status('400').send({err: "Error deleting reminder"});
    });
});

router.patch("/api/updateReminder", checkIfAuthenticated, function(req, res){
    let postID = req.body.id;
    let name = req.body.name;
    let eventMonth = parseInt(req.body.eventMonth);
    let eventDay = parseInt(req.body.eventDay);
    let daysBefore = parseInt(req.body.daysBefore);

    // validate data
    if (name == "" || isNaN(eventMonth) || isNaN(eventDay) || isNaN(daysBefore)){
        res.status(400).json({err: "Invalid Data."});
        return;
    }

    let daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (eventMonth > 12 || eventMonth < 1 || eventDay < 1 || eventDay > daysInMonth[eventMonth - 1] ||
        daysBefore < 1 || daysBefore > 90){
        res.status(400).json({err: "Invalid Data."});
        return;
    }

    let id = req.user.id;

    let data = {
        name: name,
        eventMonth: eventMonth,
        eventDay: eventDay,
        daysBefore: daysBefore
    };

    let dbRef = getDBRef();
    let updateDoc = dbRef.collection("/Data/Reminders/" + id).doc(postID).set(data, {merge: true})
    .then(writeResult => {
        console.log("update successful");
        res.status('200').send({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status('400').send({error: "Error updating reminder."});
    });

});

/*
    Settings
*/

router.get("/api/getSettings", checkIfAuthenticated, function(req, res){

});

router.patch("/api/updateSettings", checkIfAuthenticated, function(req, res){
    
});

module.exports = router;

let getDBRef = function(){
    let adminRef = require('../app').admin;
    return adminRef.firestore();
};

let remindersCompareFunc = function(first, second){
    let firstName = first.get('name');
    let secondName = second.get('name');

    let currYear = new Date().getFullYear();
    let firstDate = new Date(currYear, first.get('eventMonth') - 1, first.get('eventDay'));
    let secondDate = new Date(currYear, second.get('eventMonth') - 1, second.get('eventDay'));

    if (firstName < secondName){
        return 1;
    } else if(firstName > secondName){
        return -1;
    } else {
        if (firstDate < secondDate){
            return 1;
        } else if (firstDate > secondDate){
            return -1;
        } else {
            return 0;
        }
    }
}