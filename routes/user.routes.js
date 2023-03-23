const Router = require('express')
const router = new Router
const userController = require('../controller/user.controller')
const {check} = require('express-validator')

router.post('/registration', [
    check('name', 'Username cannot be empty').notEmpty(),
    check('email', 'email cannot be empty and must be in email format').isEmail(),
    check('password', 'password must be greater than 1 and lesser than 10 symbols')
        .isLength({min: 1, max: 10})
], userController.registerNewUser)
router.post('/login',[
    check('email', 'email cannot be empty and must be in email format').isEmail(),
    check('password', 'password must be greater than 1 and lesser than 10 symbols')
        .isLength({min: 1, max: 10})], userController.login)
router.get('/users', userController.getUsers)
router.put('/updateStatus/:id', userController.updateStatus)
router.delete('/user/:id', userController.deleteUser)

module.exports = router