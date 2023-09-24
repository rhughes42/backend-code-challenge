const express = require('express')
const { Readable } = require('stream')

const lookups = require('../services/lookups.js')
const logger = require('../services/logger.js')

// Create a router object.
const apiRouter = express.Router()

const cities = require('../data/addresses.json')
lookups.dictionaryPass(cities, 'tags')

// Function to calculate the distance between two points using the Haversine formula.
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance.toFixed(2)
}

// In-memory store for tasks
const tasks = {}

const calculateWithinDistance = async (taskId, id, maxDistance) => {
    let distances = [] // Initialize the distances array

    let center = cities.find((city) => city.guid === id) // Use find to get a single city object

    if (!center) {
        console.error(`City with id ${id} not found`)
        tasks[taskId] = 'Failed'
        return []
    }

    // Loop through all cities
    for (let i = 0; i < cities.length; i++) {
        // Calculate the distance between the two cities
        const distance = calculateDistance(
            center.latitude, // Access latitude and longitude on the city object
            center.longitude,
            cities[i].latitude,
            cities[i].longitude
        )

        if (distance <= maxDistance) {
            // Store the city and distance in the array
            distances.push({
                guid: cities[i].guid,
                distance,
            })
        }
    }

    tasks[taskId] = 'Completed'

    return distances
}

// Define a simple default route.
apiRouter.get('/', (_req, res) => {
    logger.info("Processing '/' route.")
    res.send(200)
})

apiRouter.get('/city', (req, res) => {
    logger.info("Processing '/city' route.")

    const { isActive, tag } = req.query

    // Convert query param isActive to boolean as it is received as a string.
    const isActiveBoolean = isActive === 'true'

    // Filter the array based on the isActive property and whether the tags array contains the tag.
    const result = cities.filter(
        (obj) => obj.isActive === isActiveBoolean && obj.tags.includes(tag)
    )

    if (result.length > 0) {
        return res.json(result[0]) // Return the first matched city object directly.
    } else {
        return res.status(404).send('City not found.')
    }
})

apiRouter.get('/distance', (req, res) => {
    logger.info("Processing '/distance' route.")

    const { first, second } = req.query

    let locations = cities.filter(
        (city) => city.guid === first || city.guid === second
    )

    // Convert string query parameters to number.
    const latitude1 = Number(locations[0].latitude)
    const longitude1 = Number(locations[0].longitude)

    const latitude2 = Number(locations[1].latitude)
    const longitude2 = Number(locations[1].longitude)

    if (
        isNaN(latitude1) ||
        isNaN(longitude1) ||
        isNaN(latitude2) ||
        isNaN(longitude2)
    ) {
        return res.status(400).send('Invalid input.')
    }

    const distance = calculateDistance(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    )

    res.json({ distance })
})

apiRouter.get('/distances', async (req, res) => {
    const { target } = req.query

    const taskId = '1695507115254' // Hardcoded for testing

    try {
        // If calculateWithinDistance is asynchronous, you should await it
        withinDistance = await calculateWithinDistance(taskId, target, 250)

        // Store the task status as 'Pending'
        tasks[taskId] = 'Pending'

        // Respond with the task ID or the calculated distances
        res.json(withinDistance)
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
})

apiRouter.get('/all-cities', (req, res) => {
    logger.info("Processing '/all-cities' route.")

    // Set the Content-Type to application/json
    res.setHeader('Content-Type', 'application/json')

    // Create a readable stream from the cities array
    const readableStream = Readable.from(JSON.stringify(cities))

    // Pipe the readable stream to the response object
    readableStream.pipe(res)
})

// Endpoint to poll for task status
apiRouter.get('/taskStatus', (req, res) => {
    const { Id } = req.query

    const taskStatus = tasks[Id]

    if (taskStatus) {
        res.json({ withinDistance })
    } else {
        res.status(404).json({ error: 'Task not found...' })
    }
})

module.exports = apiRouter
