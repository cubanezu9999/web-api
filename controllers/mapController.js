require('dotenv').config()
const express = require("express")
const mapController = express.Router()
const jwt = require('jsonwebtoken')



mapController.use(express.json())


const connection = require('../conectDB')






const mysql = require("mysql2");
const cors = require("cors");
mapController.use(cors());



connection.connect((err) => {
    if (err) {
        console.log(`Failed to connect ${err}`);
    } else {
        mapController.get("/poi/:region", (req, res) => {
            connection.query(
                "SELECT * FROM pointsofinterest where region = ?", [req.params.region],

                (err, results) => {
                    if (err) {
                        res.status(500).json({ error: err });
                    } else {
                        res.json(results);
                    }
                }
            );
        });
        mapController.post('/poi/addpoint', authenticateToken, (req, res) => {
            connection.query('SELECT * FROM pointsofinterest WHERE name = ? AND type = ?', [req.body.name, req.body.type], (error, result) => {
                if (result.length > 0) {
                    res.json("This point already exists.Please mention another point")
                } else if (error) {
                    console.log(error)
                } else {
                    connection.query('INSERT INTO pointsofinterest(name,type,country,region,lon,lat,description,recommendations) VALUES(?,?,?,?,?,?,?,0)', [req.body.name, req.body.type, req.body.country, req.body.region, req.body.longitude, req.body.latitude, req.body.description], (error, result) => {
                        if (error) {
                            console.log(error)
                            res.json('You try to add an incomplete point of intrest,please check again')
                        } else {

                            res.json("point added")
                        }
                    })
                }
            })

        });
        mapController.post('/poi/recommend/:id', authenticateToken, (req, res) => {

            connection.query('UPDATE pointsofinterest SET recommendations = recommendations+1 WHERE ID = ?', [parseInt(req.params.id)], (err, results) => {

                if (err) {

                    res.status(404).json("Could not find a record of this point od interest")
                } else if (results.affectedRows == 1) {

                    res.json('Your point has been recommended')
                }
            })
        })
        mapController.post('/poi/review/:id', authenticateToken, (req, res) => {

            connection.query('INSERT INTO poi_reviews(poi_id,review) VALUES(?,?)', [req.params.id, req.body.reviewtext], (err, result) => {
                if (err) {
                    console.log(err)
                } else {

                    res.json('Review added successfully')
                }
            })
        })
        mapController.get('/poi/reviews/:id', (req, res) => {

            connection.query('SELECT * FROM poi_reviews WHERE poi_id = ?', [req.params.id], (err, result) => {
                if (err) {
                    res.status(500).json('Internal server error')
                } else if (result.length == 0) {

                    res.status(200).json(['No reviews yet'])

                } else { res.status(200).json(result) }
            })
        })
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        next()
    })
}


module.exports = mapController