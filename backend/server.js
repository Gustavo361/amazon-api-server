// Bellow, all the dependencies downloaded are imported now.

const express = require('express')
const axios = require('axios')
const { JSDOM } = require('jsdom')
const cors = require('cors')

// Create an instance of the Express server
const app = express()

// Enabling CORS on the server to allow requests from different origins and not get blocked.
app.use(cors())

// Defines the server port
const PORT = process.env.PORT || 3000

// Route for the scraping API
app.get('/api/scrape', async (req, res) => {
    try {
        // Get the keyword from the request query
        const keyword = req.query.keyword

        // Construct the Amazon search URL based on the keyword.
        const url = `https://www.amazon.com/s?k=${keyword}`

        // Make a GET request to the search URL
        const response = await axios.get(url, {
            // Define request headers with User-Agent.
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        })

        // Get the HTML from the response data
        const html = response.data

        // Create a DOM from the HTML
        const dom = new JSDOM(html)

        // Get the document from the DOM.
        const document = dom.window.document

        // Array to store the extracted products from the page.
        const products = []

        // Select all search result items.
        document.querySelectorAll('.s-result-item').forEach((item) => {
            // Select the product title element.
            const titleElement = item.querySelector('h2')

            // Check if the title element exists, if not, skip to the next item
            if (!titleElement) return

            // Get and trim the product title text
            const title = titleElement.textContent.trim()

            // Select the product rating element
            const ratingElement = item.querySelector('.a-icon-star-small')

            // Check if the rating element exists, if not, skip to the next item
            if (!ratingElement) return

            // Get and convert the product rating to a number
            const rating = parseFloat(ratingElement.textContent.split(' ')[0])

            // Select the product rating element
            const reviewsElement = item.querySelector('.a-size-small')

            // Check if the reviews element exists, if not, skip to the next item
            if (!reviewsElement) return

            // Get and convert the number of reviews to an integer
            const reviews = parseInt(reviewsElement.textContent.replace(/[^\d]/g, ''))

            // Select the product image element
            const imageUrlElement = item.querySelector('img')

            // Check if the image element exists, if not, skip to the next item
            if (!imageUrlElement) return

            // Get the product image URL
            const imageUrl = imageUrlElement.getAttribute('src')

            // Add the product information to the products array
            products.push({ title, rating, reviews, imageUrl })
        })

        // Return the extracted data in JSON format in the response
        res.json(products)

    } catch (error) { // Handlinig the errors
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal Server Error', message: error.message })
    }
})

// Start the server on the specified port (3000) and displays a message on the console.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})