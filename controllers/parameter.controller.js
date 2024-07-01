const { Op, Sequelize, where } = require("sequelize");
const asyncHandler = require("../middlewares/async");
const db = require("../models");
const { raw } = require("express");
const Parameter = db.parameter
const Zone = db.zone


// Desc: Add parameter 
// Route: POST /parameter/add
// Access: Only by devices

exports.addParameter = asyncHandler(async (req, res, next) => {
    const { temperature, humidity, heatIndex, pm1_0, pm2_5, pm10, zoneId } = req.body

    // Check if zone exist in database or not
    const zoneFound = await Zone.findByPk(zoneId)
    if(!zoneFound){
        return res.status(400).json({
            success: false,
            message: 'Zone not found'
        })
    }
    
    await Parameter.create({
        temperature,
        humidity,
        heatIndex,
        pm1_0,
        pm2_5,
        pm10,
        zoneId
    })

    res.status(201).json({
        success: true,
    })

})

// Desc: Get all parameters data
// Route: GET /parameter/all
// Access: Authorized (JWT token)

exports.getParameters = asyncHandler(async (req, res, next) => {
    // Get all parameters
    const parameters = await Parameter.findAll()
    // Extract temperature values into an array
    let temperatures = []
    parameters.forEach(parameter => {
        temperatures.push(parameter.temperature)
    });
    // Extract humidity values into an array
    let humidities = []
    parameters.forEach(parameter => {
        humidities.push(parameter.humidity)
    });

    // Extract pm2_5 values into an array
    let pm2_5 = []
    parameters.forEach(parameter => {
        pm2_5.push(parameter.pm2_5)
    });

    // Extract the time when data created into an array
    let createdAt = []
    parameters.forEach(parameter => {
        createdAt.push( parameter.createdAt.toString().substring(8, 10) + '/' + parameter.createdAt.toString().substring(4, 8) + parameter.createdAt.toString().substring(16, 21))
    });
    
    res.status(200).json({
        success: true,
        temperatures,
        humidities,
        pm2_5: pm2_5,
        createdAt

    })

})


// Desc: Get parameters by zone id
// Route: GET /parameter/zone/:id
// Access: Authorized (JWT token)
exports.getParametersByZoneId = asyncHandler(async (req, res, next) => {
    const zoneId = req.params.id;
    
    const parameters = await Parameter.findAll({where: {zoneId: zoneId}, order: [['id', 'ASC']]})

    // check if parameters is empty
    if(parameters.length == 0){
        return res.status(400).json({
            success: false,
            message: 'No parameters found by the zone id'
        })
    }

    // get zone
    const zone = await Zone.findByPk(zoneId)

    let temperatures = []
    let humidities = []
    let pm2_5 = []
    let createdAt = []
    let year = ''
    let zoneName = zone.zoneName

    // Extract temperature values into the array
    parameters.forEach(parameter => {
        temperatures.push(parameter.temperature)
    });

    // Extract humidity values into the array
    parameters.forEach(parameter => {
        humidities.push(parameter.humidity)
    });

    // Extract pm2_5 values into the array
    parameters.forEach(parameter => {
        pm2_5.push(parameter.pm2_5)
    });

    // Extract the time when data created into the array
    parameters.forEach(parameter => {
        createdAt.push( parameter.createdAt.toString().substring(8, 10) + '/' + parameter.createdAt.toString().substring(4, 8) + parameter.createdAt.toString().substring(16, 21))
    });

    year = parameters[0].createdAt.toString().substring(11, 15)


    res.status(200).json({
        success: true,
        temperatures,
        humidities,
        pm2_5,
        createdAt,
        year,
        zoneName
    })

})

// Desc: Get parameters of the zone in which pm2_5 is the highest
// Route: GET /parameter/max-pm2_5
// Access: Authorized (JWT token)
exports.getParametersMaxDustZone = asyncHandler(async (req, res, next) => {

    // get all zone IDs
    const data = await Zone.findAll({attributes: ['id'], raw: true})
    let zoneIDs = []
    data.forEach(element => {
        zoneIDs.push(element.id)
    });

    // get all the last created pm2_5 values by zone IDs
    const latestpm2_5Values = await Parameter.findAll({
        where: {
          zoneId: {
            [Op.in]: zoneIDs
          },
          createdAt: {
            [Op.eq]: Sequelize.literal(`(
              SELECT MAX("createdAt")
              FROM "parameters" AS p2
              WHERE p2."zoneId" = "parameter"."zoneId"
            )`)
          }
        },
        attributes: ['id', 'pm2_5', 'createdAt', 'zoneId'],
        order: [['zoneId', 'ASC']]
      });
    let latestValues = []
    latestpm2_5Values.forEach(element => {
        latestValues.push(element.dataValues)
    })

    // console.log(latestValues)


    // find the maximum value among the pm2_5 values and find its zone ID
    let maxpm2_5ParamIndex = 0
    for (let index = 0; index < latestValues.length; index++) {
        if(latestValues[index].pm2_5 > latestValues[maxpm2_5ParamIndex].pm2_5){
            maxpm2_5ParamIndex = index
        }        
    }
    
    const maxpm2_5ZoneId = latestValues[maxpm2_5ParamIndex].zoneId

    // get all the parameters by the zone ID
    const maxpm2_5ZoneParams = await Parameter.findAll({where: {zoneId: maxpm2_5ZoneId}, order: [['id', 'ASC']]})

    // Extract temperature values into an array
    let temperatures = []
    maxpm2_5ZoneParams.forEach(parameter => {
        temperatures.push(parameter.temperature)
    });
    // Extract humidity values into an array
    let humidities = []
    maxpm2_5ZoneParams.forEach(parameter => {
        humidities.push(parameter.humidity)
    });


    // Extract pm2_5 values into an array
    let pm2_5 = []
    maxpm2_5ZoneParams.forEach(parameter => {
        pm2_5.push(parameter.pm2_5)
    });

    // Extract the time when data created into an array
    let createdAt = []
    maxpm2_5ZoneParams.forEach(parameter => {
        createdAt.push( parameter.createdAt.toString().substring(8, 10) + '/' + parameter.createdAt.toString().substring(4, 8) + parameter.createdAt.toString().substring(16, 21))
    });

    // Find the zone name and location
    const zone = await Zone.findByPk(maxpm2_5ZoneId)
    

    res.status(200).json({
        success: true,
        temperatures,
        humidities,
        pm2_5,
        createdAt,
        zoneName: zone.zoneName,
        zoneLocation: zone.zoneLocation
    })


})

// Desc: Get parameters by zone id by days
// Route: GET /parameters/days/zone/:id
// Access: Authorized (JWT token)
exports.getParametersByZoneIdByDays = asyncHandler(async (req, res, next) => {

    const zoneId = req.params.id;

    
     // Find the earliest createdAt date in the database
     const earliestParameter = await Parameter.findOne({
        attributes: [[Sequelize.fn('MIN', Sequelize.col('createdAt')), 'earliestDate']],
        raw: true
    });

    const startDate = earliestParameter.earliestDate;
    const endDate = new Date();

    const parameters = await Parameter.sequelize.query(
        `
        SELECT 
            DATE("createdAt") AS "date", 
            MAX("temperature") AS "maxTemperature", 
            MIN("temperature") AS "minTemperature",
            MAX("humidity") AS "maxHumidity", 
            MIN("humidity") AS "minHumidity",
            MAX("pm2_5") AS "maxPm2_5", 
            MIN("pm2_5") AS "minPm2_5"
        FROM "parameters"
        WHERE "zoneId" = 1
        AND "createdAt" BETWEEN :startDate AND :endDate
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") ASC;

        `,
        {
            replacements: { zoneId, startDate, endDate },
            type: Sequelize.QueryTypes.SELECT
        }
    );

    // Check if parameters is empty
    if (parameters.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No parameters found by the zone id'
        });
    }

    console.log(parameters)

    res.status(200).json({
        success: true,
        parameters,
        endDate
    })


})