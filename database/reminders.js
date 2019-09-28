let main = async function(){
    console.log('task started');
    let reminders = await getReminders();
    console.log(reminders);
    if (reminders.length == 0){
        console.log("no reminders to send");
    } else {
        await sendReminders(reminders).catch(console.error);
        console.log("done sending reminders");
    }
};

let getReminders =  async function(){
    let adminRef = require('../app').admin;
    let dbRef = adminRef.firestore();

    let remindersToSend = await dbRef.collection("/Admin/Users/Login").get()
    .then(qs => {
        return qs.docs;
    })
    .then(docs => {
        let users = new Map();
        for (let doc of docs){
            users.set(doc.id, doc.get('emailReceive'));
        }
        return users;
    })
    .then(async (users) => {
        let queries = [];
        users.forEach(function(email, id, map){
            queries.push(dbRef.collection("/Data/Reminders/" + id).get());
        });

        let filteredReminders = await Promise.all(queries)
        .then(querySnapshots => {
            return {docs: querySnapshots.map(qs => qs.docs).reduce((acc, docs) => [...acc, ...docs]),
                    users: users
            };
        })
        .then(obj => {
            let docs = obj.docs;

            let reminders = [];
            for (let doc of docs){
                let month = doc.get('eventMonth');
                let day = doc.get('eventDay');
                let daysBefore = doc.get('daysBefore');
                if (checkIfCurrDate(month, day, daysBefore)){
                    reminders.push({
                        "email": obj.users.get(doc.ref.parent.id),
                        "name": doc.get('name'),
                        "month": month,
                        "day": day,
                        "daysBefore": daysBefore
                    });
                }
            }
            return reminders;
        });
        return filteredReminders;
    })
    .catch(err => {
        console.log(err);
        return null;
    });

    return remindersToSend;
};

let checkIfCurrDate = function(month, day, daysBefore){
    //console.log(month + "/" + day + ": " + daysBefore);
    let currMonth = new Date(Date.now()).getMonth() + 1;
    let currDay = new Date(Date.now()).getDate();
    let daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let correctMonth = month;
    let correctDay = day;


    if (day > daysBefore){
        correctDay = day - daysBefore; 
    } else {
        let leftover = daysBefore - day;
        correctMonth = month <= 1 ? 12 : month - 1;
        correctDay = daysInMonth[correctMonth - 1] - leftover;
    }

    /*
    console.log(correctMonth + "/" + correctDay);
    console.log(currMonth + "/" + currDay);*/

    if (currMonth == correctMonth && currDay == correctDay){
        return true;
    } else {
        return false;
    }

}

let sendReminders = async function(reminders){
    const nodemailer = require('nodemailer');

    let transporter = nodemailer.createTransport({
        pool: true,
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 465,
        maxMessages: Infinity,
        rateMessages: 1,
        secure: false, // true => TLS port 587, false => SSL port 465
        auth: {
            //type: 'OAuth2',
            user: process.env.EMAIL,
            pass: process.env.PASS
            //serviceClient: process.env.EMAIL_CLIENT_ID,
            //privateKey: process.env.EMAIL_PRIVATE_KEY,
        }
    });

    let numReminders = reminders.length;
    while (numReminders > 0){
        let user = reminders[numReminders - 1];
        let o = await transporter.sendMail({
        from: '"Remem Admin" <zipoinc@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'REMEM Notification', // Subject line
        text: 'This is a reminder from Remem that ' + user.name + '\'s birthday is on ' + user.month + '/' + user.day, // plain text body
        html: '' // html body
        }).then(() => {
            console.log('Message sent successfully!');
            numReminders--;
        })
        .catch((err) => {
            console.log('Error occurred');
            console.log(err.message);
        });
    }
}

module.exports = main;