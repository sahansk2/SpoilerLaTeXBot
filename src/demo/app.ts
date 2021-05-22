import { findExpressions, get_image } from '../lib'

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
    get_image(JSON.parse(req.body)).then(
      (img: any) => {
        res.write(img)
        res.end()
      }
    )
    .catch((err: any) => {
        console.log(err)
        res.status(500)
        res.end()
    })
})

app.use(express.static(__dirname + '/static'))

const demoInit = () => {
  const port = process.env.DEMOPORT || 3000
  app.listen(port, () => {
    console.log('Now listening on http://localhost:' + port)
  })
}

export default demoInit
