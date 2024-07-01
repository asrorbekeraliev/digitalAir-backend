const { Router } = require('express')
const { 
    addZone,
    getAllZone,
    getZoneById,
    getAllZoneConditions


} = require('../controllers/zone.controller.js')
const router = Router()

const { protected, apiKeyAccess, adminAccess } = require('../middlewares/auth.js')

// Route: /zones
router.post('/add', protected, adminAccess, addZone),
router.get('/all', protected, getAllZone),
router.get('/conditions', protected, getAllZoneConditions),
router.get('/:id', protected, getZoneById)


module.exports = router