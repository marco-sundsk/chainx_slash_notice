'use strict';

const curTime = require("./util_time");
const cfg = require("./config");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    "host": cfg.email.host,
    "port": cfg.email.port,
    "secureConnection": cfg.email.ssl, // use SSL
    "auth": {
        "user": cfg.email.uid, // user name
        "pass": cfg.email.pwd  // password
    }
});

exports.sendMail = async function (title, body, to) {
    let mailOptions = {
        from: cfg.email.from, // sender address mailfrom must be same with the user
        to: to, // list of receivers
        subject: title, // Subject line
        text: body, // plaintext body
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(curTime(), 'Message sent: ' + info.response);
    } catch(err) {
        console.log(err);
    }
};