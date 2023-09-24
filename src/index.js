const express = require('express')
const assert = require('assert')
const fs = require('fs-extra')
const axios = require('axios')
const dotenv = require('dotenv')
const apiRouter = require('./api/routes.js')
const stream = require('stream')
const { promisify } = require('util')

dotenv.config()

const app = express()
const port = 3000

app.use('/api', apiRouter)

app.use((req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized')
    }
    next()
})

app.listen(port, () => {
    console.log(`🖥️ Server is running at http://localhost:${port}`)
})

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
    },
})

async function fetchCity() {
    try {
        const response = await axiosInstance.get('/city', {
            params: { tag: 'excepteurus', isActive: true },
        })
        const city = response.data

        assert.strictEqual(city.guid, 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408')
        assert.strictEqual(city.latitude, -1.409358)
        assert.strictEqual(city.longitude, -37.257104)

        return city
    } catch (error) {
        console.error(error)
    }
}

;(async () => {
    try {
        const city = await fetchCity()

        const distanceResponse = await axiosInstance.get('/distance', {
            params: {
                first: city.guid,
                second: '17f4ceee-8270-4119-87c0-9c1ef946695e',
            },
        })
        const distance = distanceResponse.data
        console.log(distance)

        const resResponse = await axiosInstance.get('/distances', {
            params: {
                target: city.guid,
            },
        })
        const res = resResponse.data
        console.log(res)

        const path = './all-cities.json'

        const fileExists = await fs.pathExists(path)

        if (fileExists) {
            await fs.remove(path)
            console.log('File removed successfully.')
        } else {
            console.log('File does not exist, no action taken.')
        }

        const result = await fetch('http://localhost:3000/api/all-cities', {
            headers: { Authorization: `Bearer ${process.env.TOKEN}` },
        })

        if (result.ok) {
            if (await fs.pathExists('./all-cities.json')) {
                await fs.remove('./all-cities.json')
            }

            const dest = fs.createWriteStream('./all-cities.json')
            await promisify(stream.pipeline)(result.body, dest)
        } else {
            console.error('Failed to fetch all cities:', result.statusText)
        }

        const taskStatusResponse = await axiosInstance.get(`/taskStatus`, {
            params: {
                Id: '1695507115254',
            },
        })
        const taskStatus = taskStatusResponse.data
        console.log(taskStatus)
    } catch (error) {
        console.error('Error occurred:', error)
    }
})()

process.on('uncaughtException', (err) => {
    console.error(err)
})
