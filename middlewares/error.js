const ErrorResponse = require('../utils/errorResponse.js')

const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    error.message = err.message

    // message for developer
    console.log(err.stack)

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server error'
    })
}

module.exports = errorHandler