const { sequelize, Sequelize } = require(".");


module.exports = (sequelize, Sequelize) => {
    const Zone = sequelize.define('zone', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        zoneName: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
        },
        deviceLocation: {
            type: Sequelize.STRING(500),
        }
    })
    return Zone
}