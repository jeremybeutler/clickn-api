const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect')

const User = mongodb_connect.db.collection('users')
const Click = mongodb_connect.db.collection('click')