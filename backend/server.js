const express = require('express')
const axios = require('axios')
const { JSDOM } = require('jsdom')
const cors = require('cors')

const app = express()

app.use(cors())

const PORT = process.env.PORT || 3000

app.get('/api/scrape', async (req, res) => {
    try {
        const keyword = req.query.keyword
        console.log('Palavra-chave:', keyword)

        const url = `https://www.amazon.com/s?k=${keyword}`
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        })
        const html = response.data

        const dom = new JSDOM(html)
        const document = dom.window.document

        const products = []

        document.querySelectorAll('.s-result-item').forEach((item) => {
            const titleElement = item.querySelector('h2')
            if (!titleElement) return
            const title = titleElement.textContent.trim()
            const ratingElement = item.querySelector('.a-icon-star-small')
            if (!ratingElement) return
            const rating = parseFloat(ratingElement.textContent.split(' ')[0])
            const reviewsElement = item.querySelector('.a-size-small')
            if (!reviewsElement) return
            const reviews = parseInt(reviewsElement.textContent.replace(/[^\d]/g, ''))
            const imageUrlElement = item.querySelector('img')
            if (!imageUrlElement) return
            const imageUrl = imageUrlElement.getAttribute('src')

            products.push({ title, rating, reviews, imageUrl })
        })

        res.json(products)

    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal Server Error', message: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})