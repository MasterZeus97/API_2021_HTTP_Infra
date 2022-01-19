var Chance = require('chance');
var chance = new Chance();

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Quote of the day!\n')
})

app.get('/quote', (req, res) => {
  res.send(generateQuote())
})

app.listen(port, () => {
  console.log(`Accepting request on port ${port}`)
})

function generateQuote() {
    var quote;

    var gender = chance.gender()

    quote = {
        sentence : chance.sentence(),

        firstName: chance.first({
            gender: gender
        }),
        lastName: chance.last(),
        country : chance.country()
    }

    console.log(quote)
    return quote
}