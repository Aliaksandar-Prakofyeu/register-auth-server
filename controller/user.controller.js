const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')
const {where} = require('sequelize')
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
        if(!errors.isEmpty()){
            res.status(400).json({message: 'Error during registration', errors})
        }
        const {name, email, password} = req.body
        if (!name) {
            return next(ApiError.badRequest)('Incorrect name')
        } else if (!email) {
            return next(ApiError.badRequest)('Incorrect email')
        } else if (!password) {
            return next(ApiError.badRequest('Incorrect password'))
        }

        const candidate = await User.findOne({where: {email}})

        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({name, email, password: hashPassword})
        const token = generateJwt(user.id, user.email)
        return res.json({token})

    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('User not found'))
        }
        if (user.status === 'blocked'){
            return next(ApiError.badRequest('you blocked'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Wrong password'))
        }
        const token = generateJwt(user.id, user.email)
        return res.json({token})
    }

    async getUsers(req, res) {
        const users = await User.findAndCountAll()
        return res.json(users)
    }

    async updateStatus(req, res) {

            const {id} = req.params
            const {status} = req.body
        try {
            const user = await User.update({status}, {where: {id}})
            return res.json(user)
        } catch (error) {
            res.status(500).json({message: 'Failed to update status', error})
        }
    }

    async deleteUser(req, res){
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await user.destroy();

            return res.status(204).end();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async check(req, res) {
        const token = generateJwt((req.user.id, req.user.email))
        return res.json({token})
    }
}

module.exports = new UserController()