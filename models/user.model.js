const { Sequelize } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        firstname: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        lastname: {
            type:  Sequelize.STRING(255),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(255),
            isEmail: true,
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING(80),
            allowNull: false
        },
        isVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    })

    return User
}