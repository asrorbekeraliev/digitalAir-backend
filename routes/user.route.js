const { Router } = require('express')
const { 
    register,
    login,
    getAllUsers,
    makeAdmin,
    cancelAdmin,
    deleteUser,
    verifyEmail


} = require('../controllers/user.controller.js')
const router = Router()

const { protected, apiKeyAccess, adminAccess } = require('../middlewares/auth.js')

// api/v1/auth/
router.post('/register', register)
router.post('/login', login)
router.get('/all-users', protected,  getAllUsers)
router.put('/makeadmin/user/:id', protected, adminAccess, makeAdmin)
router.put('/canceladmin/user/:id', protected, adminAccess, cancelAdmin)
router.delete('/delete/user/:id', protected, adminAccess, deleteUser)
router.get('/email-verify/:id/:token', verifyEmail)

module.exports = router