const { where } = require("sequelize");
const asyncHandler = require("../middlewares/async");
const db = require("../models");
const { raw } = require("express");
const Zone = db.zone



// Desc: Add zone 
// Route: POST /zone/add
// Access: Admin

exports.addZone = asyncHandler(async (req, res, next) => {
    const { zoneName, zoneId, deviceLocation } = req.body

    console.log(req.body)


    // Check if the zone already in database
    const foundZone = await Zone.findAll({where: {zoneName: zoneName.toUpperCase()}})

    if(foundZone[0]){
        return res.status(400).json({
            success: false,
            message: 'This zone already exist in the system'
        })
    }


    // create a zone in database
    const result = await Zone.create({
        zoneName: zoneName.toUpperCase(),
        id: parseInt(zoneId),
        deviceLocation
    })

    res.status(201).json({
        success: true,
        zone: result
    })

})

// Desc: Get all zone 
// Route: GET /zone/all
// Access: Authorized (JWT)
exports.getAllZone = asyncHandler(async (req, res, next) => {
    const zones = await Zone.findAll()
    res.status(200).json({
        success: true,
        zones
    })
})

// Desc: Get zone by zone id
// Route: GET /zone/:id
// Access: Authorized (JWT)
exports.getZoneById = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    
    const zone = await Zone.findOne({
        include: ['parameters']
    })

    if(!zone){
        return res.status(400).json({
            success: false,
            message: 'Zone not found'
        })
    }

    res.status(200).json({
        success: true,
        zone
    })
})

// Desc: Get all zone conditions
// Route: GET /zone/conditions
// Access: Authorized (JWT)
exports.getAllZoneConditions = asyncHandler( async(req, res, next) => {
    
    // Get all zones including parameters
    const zones = await Zone.findAll({
        include: ['parameters']
    })

    // Make a dictionary: keys = zones, values = lastpm2_5Values
    let zonesDict = {}

    zones.forEach((zone) => {

        // Check if the zone has parameters or not (if the device is installed or not)
        if(zone.parameters.length > 0){
            zonesDict[zone.zoneName] = zone.parameters[zone.parameters.length - 1].pm2_5
        } else {
            zonesDict[zone.zoneName] = 'No device installed in this area'
        }
        
    });


    res.status(200).json({
        success: true,
        zonesDict
    })

})



