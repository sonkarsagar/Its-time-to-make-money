const Sequelize=require('sequelize')

const sequelize=new Sequelize('new_schema', 'root', 'SagarS123@',{
    dialect: 'mysql',
    hot: 'localhost'
})

module.exports=sequelize