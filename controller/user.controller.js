const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')
const {where, DataTypes} = require('sequelize')
const {validationResult} = require('express-validator')

const generateJwt = (id, email) => {
    return jwt.sign({id, email},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registerNewUser(req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({message: 'Error during registration', errors})
        }
        const {name, email, password} = req.body
        if (!name) {
            res.status(400).json({message: 'Incorrect name', errors})
        } else if (!email) {
            res.status(400).json({message: 'Incorrect email', errors})
        } else if (!password) {
            res.status(400).json({message: 'Incorrect password', errors})
        }

        const candidate = await User.findOne({where: {email}})

        if (candidate) {
            res.status(400).json({message: 'User with this email already exists', errors})
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({name, email, password: hashPassword})
        const token = generateJwt(user.id, user.email)
        user.changed('last_login_time', true)
        await user.save()
        return res.json({token})

    }

    async login(req, res, next) {
        const errors = validationResult(req)
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            res.status(500).json({message: 'User not found', errors})
        }
        if (user.status === 'blocked') {
            res.status(500).json({message: 'You blocked', errors})
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            res.status(500).json({message: 'Wrong password', errors})
        }
        const token = generateJwt(user.id, user.email)
        user.changed('last_login_time', true)
        await user.save()
        return res.json({token})
    }

    async getUsers(req, res) {
        try {
            const users = await User.findAll()
            return res.json(users)
        } catch (error) {
            console.error(error)
            res.status(500).json({message: 'Server not responding'})
        }
    }

    async updateStatus(req, res) {
        const {id} = req.params
        const {status} = req.body
        try {
            const user = await User.update({status}, {where: {id}})
            return res.json(user)
        } catch (error) {
            console.error(error)
            res.status(500).json({message: 'Failed to update status', error})
        }
    }

    async deleteUser(req, res) {
        try {
            const {id} = req.params
            const user = await User.findByPk(id)
            if (!user) {
                return res.status(404).json({message: 'User not found'})
            }
            await user.destroy()
            return res.status(204).end()
        } catch (error) {
            console.error(error)
            return res.status(500).json({message: 'Internal server error'})
        }
    }

    async check(req, res,) {
        const token = generateJwt((req.user.id, req.user.email))
        return res.json({token})
    }
}

module.exports = new UserController()