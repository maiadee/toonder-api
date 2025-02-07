import express from 'express'
import mongoose from 'mongoose'
import mongoSantize from 'express-mongo-sanitize'
import 'dotenv/config'

const app = express()