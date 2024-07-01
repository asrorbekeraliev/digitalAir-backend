const { Router } = require('express')
const { 
    addParameter,
    getParameters,
    getParametersByZoneId,
    getParametersMaxDustZone,
    getParametersByZoneIdByDays,



} = require('../controllers/parameter.controller.js')
const router = Router()

const { protected, apiKeyAccess, adminAccess } = require('../middlewares/auth.js')

router.post('/add', addParameter)
router.get('/all', protected, getParameters)
router. get('/zone/:id', protected, getParametersByZoneId)
router.get('/max-dust', protected, getParametersMaxDustZone)
router.get('/days/zone/:id', protected, getParametersByZoneIdByDays)


module.exports = router