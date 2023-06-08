const Sequelize=require('sequelize')
const sequelize=require('../util/database')
const user = sequelize.define('user',{
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    name: {
        allowNull: false,
        type: Sequelize.STRING
    },
    sur: {
        allowNull: false,
        type: Sequelize.STRING
    },
    email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        allowNull: false,
        type: Sequelize.STRING
    },
    premiumUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
})

module.exports=user