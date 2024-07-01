const Sequelize = require('sequelize')

const sequelize = new Sequelize('digitala', 'asrorbek', '12345', {
    host: 'localhost',
    // port: 5433,
    dialect: 'postgres'
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.user = require('./user.model.js')(sequelize, Sequelize)
db.parameter = require('./parameters.model.js')(sequelize, Sequelize)
db.zone = require('./zone.model.js')(sequelize, Sequelize)




// Associations  between models (tables)
// One to Many (One Zone -> Many parameters)

db.zone.hasMany(db.parameter, {
    as: 'parameters',
    onDelete: 'CASCADE',
    constraints: true
})

db.parameter.belongsTo(db.zone, {
    foreignKey: 'zoneId',
    as: 'zone'
})




module.exports = db