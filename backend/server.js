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

        const response = await axios.get(url)
        const html = response.data

        const dom = new JSDOM(html)
        const document = dom.window.document

        const products = []

        document.querySelectorAll('.s-result-item').forEach((item) => {
            const title = item.querySelector('h2').textContent.trim()
            const rating = parseFloat(item.querySelector('.a-icon-star-small').textContent.split(' ')[0])
            const reviews = parseInt(item.querySelector('.a-size-small').textContent.replace(/[^\d]/g, ''))
            const imageUrl = item.querySelector('img').getAttribute('src')

            products.push({ title, rating, reviews, imageUrl })
        })

        res.json(products)

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})