import { findExpressions, get_image } from '../src/pure'

import express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.text({ type: "application/json" }))

app.post('/detect', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(findExpressions(JSON.parse(req.body))))
})

app.post('/latex', (req, res) => {
    res.setHeader('Content-Type',  'image/png')
    get_image(req.body).then(
      (img: any) => {
        res.write(img)
        res.end()
      }
    )
})

app.use(express.static('test/static'))

app.listen(process.env.TESTPORT || 4343, () => {
    console.log('Now listening on localhost:4343')
})