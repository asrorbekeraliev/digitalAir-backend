const nodemailer = require('nodemailer')

// function to send an email to the user
module.exports.sendingMail = async({from, to, subject, text}) => {
    try {
        let mailOptions = ({
            from,
            to,
            subject,
            text
        })

        const Transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.email,
                pass: process.env.emailpassword,
            },            
        });
        
        return await Transporter.sendMail(mailOptions)


    } catch (error) {
        console.log(error)
    }

}




