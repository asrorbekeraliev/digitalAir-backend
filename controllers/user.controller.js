const db = require('../models/index.js')
const User = db.user
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middlewares/async.js')
const uuid = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendingMail } = require('../nodemailer/mailing.js')
const { json, where } = require('sequelize')
const { raw, response } = require('express')


// Desc: user registration 
// Route: POST /auth/register
// Access: Public
exports.register = asyncHandler(async (req, res, next) => {
    // console.log(req.body)
    // Grab the data from http request
    const { firstname, lastname, email, password1, password2 } = req.body

    // Check if passwords are not the same
    if(password1 !== password2){
        return res.status(400).json({
            success: false,
            message: 'The provided passwords do not match'
        })
    }

    // Check if the email is in database already
    const userExist = await User.findOne({where: { email: email}})
    if(userExist){
        return res.status(400).json({
            success: false,
            message: 'This email has been registered already'
        })
    }

    // Make the password hashed
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password1, salt)



    // Create the user in db
    const user = await User.create({
        email,
        firstname,
        lastname,
        password: hashedPassword
    })

    // Create a json web token (jwt)
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});

    // Send email to verify
    if(user){
        sendingMail({
            from: "asrorbekeraliyev@gmail.com",
            to: `${email}`,
            subject: 'Account Verification Link',
            text: `Hello, ${firstname}. 
            Please verify your email by clicking following link:
            http://localhost:3000/api/v1/auth/email-verify/${user.id}/${token}
            
            Thank You`
        })
    }

    res.status(201).json({
        success: true,
        user: user
    })
})


// Desc: email verification
// Route: GET /auth/email-verify/:id/:token
// Access: Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const { id, token } = req.params

    if(id && token){
        // Decode the token into the user parameters. In this project, when token was creating during login (or registration) only user email was encoded in token. 
        // Therefore, only user email is verified in the decoded variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // Get the user by the email. Hide the password field.
        const user = await User.findOne({where: {'email': decoded.email}}, {'password': 0})

        if(user.id == id){

            await User.update({ isVerified: true }, {
                where: {id: id}
            })
            .then((response) => {
                return res.status(200).json({
                    success: true,
                    message: 'Your email has been verified successfully. Now, you can go to login page and login your account.'
                })
            })
            .catch((error) => {
                return res.status(400).json({
                    success: false,
                    message: 'Your email cannot be verified. Try again one more time.'
                })
            })

            
        }
    }

})


// Desc: user login 
// Route: POST /auth/login
// Access: Public
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body
    // console.log(email, ' ', password)

    //  Validate email && password
    if(!email || !password){
        return next(new ErrorResponse('Please provide email and password'), 400)
    }

    const user = await User.findOne({where: {email: email}})

    if(!user){
        return next(new ErrorResponse('Invalid Credentials'), 401)
    }

    const passwordMatched = await bcrypt.compare(password, user.password)
    if(!passwordMatched){
        return next(new ErrorResponse('Invalid Credentials'), 401)
    }

    if(user.isVerified == false){
        return next(new ErrorResponse('Not verified user'), 401)
    }
    
    // Create a json web token (jwt)
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});
    
    res.status(200).json({
        success: true,
        token: token,
        user: user
    })

})


// Desc: get all users
// Route: GET /auth/all-users
// Access: protected and only admins
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] },
    });
    res.status(200).json({
        success: true,
        users: users
    })
})


// Desc: make the role of user to admin
// Route: PUT /auth/makeadmin/user/:id
// Access: protected and only admins
exports.makeAdmin = asyncHandler(async (req, res, next) => {
    await User.update({ isAdmin: true }, {
        where: {id: req.params.id}
    })
    .then((response) => {
        res.status(200).json({
            success: true
        })
    })
})

// Desc: cancel the admin role of user
// Route: PUT /auth/canceladmin/user/:id
// Access: protected and only admins
exports.cancelAdmin = asyncHandler(async (req, res, next) => {
    await User.update({ isAdmin: false }, {
        where: {id: req.params.id}
    })
    .then((response) => {
        res.status(200).json({
            success: true
        })
    })
})


// Desc: delete a user
// Route: DELETE /auth/delete/user/:id
// Access: protected and only admins
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.destroy({
        where: {
            id: req.params.id
        }
    })
    .then((response) => {
        console.log(response)
        res.status(200).json({
            success: true
        })
    })
})



