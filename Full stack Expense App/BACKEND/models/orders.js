const Sequelize=require('sequelize')
const sequelize=require('../util/database')
const Orders=sequelize.define('Orders',{
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false
    },
    paymentId: {type: Sequelize.STRING},
    orderId: {type: Sequelize.STRING},
    status: {type: Sequelize.STRING}
})

module.exports=Orders