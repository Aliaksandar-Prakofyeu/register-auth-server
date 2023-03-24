const sequelize = require('../db')
const{DataTypes}=require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING, defaultValue: 'active'},
    registration_time:{type: DataTypes.DATE, allowNull: false},
    last_login_time:{type: DataTypes.DATE, allowNull: true}
})

module.exports = {User}