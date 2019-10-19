process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const SlackBot = require('slackbots');
const axios = require('axios');
const https = require('https');
const firestore = require('./firestore');

const BOT_AT_TAG = '<@UP4L23AKC>';

const bot = new SlackBot({
    token:'xoxb-797269439332-786682112658-ORiXL7RcXsBuUXdVZvn7bA6V',
    name: 'Team Karma',
});

// Start Handler
bot.on('start', () => {
    const params = {
        icon_emoji: ':smiley:',
    }

    bot.postMessage('general', 'Get Ready To Laugh With Joke Bot!', params);
});

// Error
bot.on('error', (err) => console.log(err));

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }
    console.log("DATA");
    console.log(data);
    handleMessage(data.text, data.user, data.channel);
});

// Respond to message
function handleMessage(message, user, channel) {
    if(message.includes('++')){
        addKarma(message, user, channel);
    } else if(message.includes('--')) {
        addKarma(message, user, channel);
    }
}

// Get a Chuck Joke
function sendResponse(givingUser, receivingUser, amount, score){

    const params = {
        icon_emoji: ':thumbsup:',
    }
    bot.postMessage('general', makeAtTag(givingUser) + " gave " + receivingUser + " " + amount + " points! Current score: " + score, params);
}

function makeAtTag(user){
    return ' <@' + user + '> ';
}


function getAtTags(message) {
    var tags = message.match(/<@.*>/g);
    var tags2 = tags[0].split(" ");
    return tags2;
}

function getScoreValue(str) {
    if(str.includes('++') && str.includes('--')){
        const params = {
            icon_emoji: ':face_with_raised_eyebrow:',
        }
        bot.postMessage('general', "Invalid score change", params);
    }
    else if(str.includes('++')){
        return str.match(/\+\+*\+/g)[0].length - 1;
    } else if(str.includes('--')){
        return 0 - str.match(/\-\-*\-/g)[0].length + 1;
    }
    return 0;
}

function addKarma(message, user, channel){
    var userTag = getAtTags(message)[1];
    var num = getScoreValue(message);

    firestore.addScore(channel, userTag, num)
    .then((res) => {
        if(num != 0){
            sendResponse(user, userTag, num, res);
        }
    })
}