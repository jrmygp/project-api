const nodemailer = require("nodemailer")

const transport = nodemailer.createTransport({
    auth: {
        user: "jeremyPWD17@gmail.com",
        pass: process.env.PASSWORD
    },
    host: "smtp.gmail.com",
})

const mailer = async ({
    subject,
    to,
    text,
    html
}) => {
    await transport.sendMail({
        subject: subject || "User verification",
        to: to,
        text,
        html
    })
}

module.exports = mailer