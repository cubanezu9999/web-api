const express = require("express")
const userController = express.Router()
const cors = require('cors')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

userController.use(express.json())



const connection = require('../conectDB')


userController.use(cors())

connection.connect(err => {
    if (err) {

        console.log(`Failed to connect ${err}`)
    } else {

        console.log("Connecting sucessfully")

        userController.post('/register', (req, res) => {
            if (err) {

                console.log(err)
            } else {
                connection.query("SELECT * FROM poi_users WHERE user_email = ?", [req.body.username], (error, result, field) => {
                    if (error) {
                        console.log(error)
                    } else if (result.length > 0) {
                        res.json("User email already used")
                    } else {
                        console.log(req.body.username)
                        let fullname = req.body.fullname;
                        let email = req.body.username
                        let password = req.body.password
                        register(fullname, email, password)
                        res.json("User registered successfully")
                    }
                })
            }


        })

        userController.post("/login", (req, res) => {
            connection.query('SELECT * FROM poi_users WHERE user_email = ?', [req.body.username], async(error, result) => {
                if (error) {
                    console.log(error)
                } else if (result.length == 0) {
                    console.log(result[0])
                    res.json('no user with this email found')
                } else {

                    let isValid = await bcrypt.compare(req.body.password, result[0].user_password)

                    if (isValid === false) {
                        res.json('username or password incorrect')
                    } else {

                        const accesToken = jwt.sign(result[0].user_email, process.env.ACCES_TOKEN_SECRET)

                        res.json({ accesToken: accesToken, name: result[0].fullname })
                    }
                }
            })
        })
    }
})













async function register(fullname, email, password) {
    const hashPassword = await bcrypt.hash(password, 10)
    connection.query("INSERT INTO poi_users(fullname,user_email,user_password)VALUES(?,?,?)", [fullname, email, hashPassword], (error, results, fields) => {
        if (error) {
            console.log(error)
        } else {

            console.log('User registered in database')
        }
    })

}








module.exports = userController;