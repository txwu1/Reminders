class User{
    constructor(id, dbUser){
        this.id = id;
        this.email = dbUser.email;
        this.password = dbUser.password;
    }

    get toJSON(){
        return (
            {
                id: this.id,
                email: this.email,
                password: this.password
            }
        )
    }
}

exports.findById = async function(id, cb){
    let adminRef = require('../app').admin;
    let dbRef = getDBRef();
    try{
    let ret = await new Promise(function(res, rej) {
        dbRef.collection("/Admin/Users/Login").where(adminRef.firestore.FieldPath.documentId(), "==", id).get()
        .then(qs => {
            if (qs.docs.length > 0){
                let dbUser = qs.docs[0].data();
                let id = qs.docs[0].id;
                let user = new User(id, dbUser);
                res([null, user.toJSON]);
            } else {
                console.log("bad");
                rej(new Error('User does not exist'));
            }
            
        })
        .catch(err => {
            console.log("worst");
            console.log(err);
            rej(new Error('User does not exist'));
        });
    });
        cb(ret[0], ret[1]);
    }
    catch(err) {
        cb(err);
    }
};

exports.findByEmail = function(email, cb){
    let dbRef = getDBRef();
    let userDoc = dbRef.collection("/Admin/Users/Login").where("email", "==", email).get()
    .then(qs => {
        if (qs.docs.length > 0){
            let dbUser = qs.docs[0].data();
            let id = qs.docs[0].id;
            let user = new User(id, dbUser);
            cb(null, user.toJSON);
        } else {
            cb(new Error('User does not exist'));
        }
        
    })
    .catch(err => {
        console.log(err);
        cb(new Error('User does not exist'));
    });
};

let getDBRef = function(){
    let adminRef = require('../app').admin;
    return adminRef.firestore();
};