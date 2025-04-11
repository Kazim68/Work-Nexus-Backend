const express = require('express')
const { getAllEmployees, createEmployee } = require('../Controller/Employee/Employee.js') 

const router = express.Router()

router.get('/all', getAllEmployees)
router.post('/create', createEmployee)

module.exports = router