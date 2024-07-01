const jwt = require('jsonwebtoken')
const asyncHandler = require('./async.js')
const ErrorResponse = require('../utils/errorResponse.js')
const db = require('../models/index.js')
const User = db.user

// Protecting routes with jwt
exports.protected = asyncHandler(async (req, res, next) => {
    let token;

    // Check the authorization in request header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer') && req.headers.authorization.length > 15){
        token = req.headers.authorization.split(' ')[1]             
    }
    // console.log(token)
    // If there is no token in request header, protect the route and make an error
    if(!token){
        return next(new ErrorResponse('Not authorized for the route to access'), 401)
    }

    // Decode the token into the user parameters. In this project, when token was creating during login (or registration) only user email was encoded in token. 
    // Therefore, only user email is verified in the decoded variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get the user by the email. Hide the password field.
    req.user = await User.findOne({where: {'email': decoded.email}}, {'password': 0})
    // console.log(req.user)

    next()
    
})

// Grant access to only admins
exports.adminAccess = (req, res, next) => {


    // Check if the user is admin or not
    if(!req.user.isAdmin){
        return next(new ErrorResponse('This action is only for admins', 403))
    }

    next()
}


// API Key access
exports.apiKeyAccess = asyncHandler(async (req, res, next) => {
    let key
    // Check if the request header includes api key
    if(req.headers.apikey){
        key = req.headers.apikey
    }
    
    // if there is no key, make error
    if(!key){
        return next(new ErrorResponse('No API Key found to access this route'), 403)
    }

    // find the user by the api key, and hide password
    const user = await User.findOne({apiKey: key}, {'password': 0})

    // check if the user does not exist, make an error
    if(!user){
        return next(new ErrorResponse('No user found for this API Key'), 400)
    }

    // check if the user status is active
    if(!user.isActive){
        return next(new ErrorResponse('Please, activate your status to get response'), 403)
    }

    // if passes all the above if conditions, go ahead
    next()

})



