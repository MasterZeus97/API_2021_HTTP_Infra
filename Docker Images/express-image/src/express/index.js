var Chance = require('chance');
var chance = new Chance();

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello Students!\n')
})

app.get('/test', (req, res) => {
  res.send(generateStudents())
})

app.listen(port, () => {
  console.log(`Accepting request on port ${port}`)
})

function generateStudents() {
    var numberOfStudents = chance.integer({
        min: 0,
        max: 10
    })
    console.log(numberOfStudents)
    var students = []
    for(var i = 0; i < numberOfStudents; ++i){
        var gender = chance.gender()
        var birthdate = chance.year({
            min: 1986,
            max: 1996
        })
        students.push({
            firstName: chance.first({
                gender: gender
            }),
            lastName: chance.last(),
            gender: gender,
            birthday: chance.birthday({
                year: birthdate
            })
        })
    }
    console.log(students)
    return students
}

