const admin = require('firebase-admin');

let serviceAccount = require('./resources/team-scoreboard-slack-bot-7ae5e876b7ab.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


exports.getScore = function(boardTag, userTag)  {
    return getUserScore(boardTag, userTag);
}

getUserScore = function(boardTag, userTag){
    return new Promise((resolve, reject) => {
        let scoreboard = db.collection('scoreboard');
        let queryRef = scoreboard.where('boardTag', '==', boardTag).get()
        .then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            resolve(0);
        }  
    
        snapshot.forEach(doc => {
            if(doc.data().userTag == userTag){
                resolve(doc.data().score);
            }
        });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            resolve(0);
        });
    });
}

exports.addScore = function(boardTag, userTag, scoreChange) {
    return new Promise((resolve, reject) => {
        let newScore = db.collection('scoreboard').doc(boardTag + userTag);
        getUserScore(boardTag, userTag).then((res) => {
            var currentScore = res;    

            console.log("SCORE CHANGE: " + scoreChange);

            let setScore = newScore.set({
                'boardTag': boardTag,
                'userTag': userTag,
                'score': currentScore + scoreChange
            });
            resolve(currentScore + scoreChange);
        });
    });
}