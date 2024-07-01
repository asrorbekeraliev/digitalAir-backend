const { sequelize, Sequelize } = require(".");


module.exports = (sequelize, Sequelize) => {
    const Parameter = sequelize.define('parameter', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        temperature: {
            type: Sequelize.REAL,
            allowNull: false
        },
        humidity: {
            type: Sequelize.REAL,
            allowNull: false
        },
        heatIndex: {
            type: Sequelize.REAL,
            allowNull: false
        },
        pm1_0: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        pm2_5: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        pm10: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        
    })
    return Parameter
}