const sequelize = require('../db')
const{DataTypes}=require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING, defaultValue: 'active'}
},
{
    timestamps: true,
    createdAt: "registration_time",
    updatedAt: "last_login_time",
})

module.exports = {User}