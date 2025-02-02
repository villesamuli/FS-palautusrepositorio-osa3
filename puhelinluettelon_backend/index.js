require('dotenv').config()
const express = require('express')
const cors = require('cors')

var morgan = require('morgan')
morgan.token('body', function (req, res) { return JSON.stringify(req.body)})
const morganLogFormat = ':method :url :status :res[content-length] - :response-time ms :body'

const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(morganLogFormat))


// const Info = (personsInBook, dateTime) => {
//   return (`<div>
//     <p>Phonebook has info for ${personsInBook} people</p>
//     <p>${dateTime}</p>
//     </div>
//     `
//   )
// }

// app.get('/info', (request, response) => {
//   const personsInBook = persons.length
//   const date = Date()
//   response.send(Info(personsInBook, date))
// })

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.deleteOne({ _id:request.params.id}).then((result) => {
    response.status(204).end
  })
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const checkDuplicateName = (name) => {
    Person.find({ name: name }).then(p => {
      if (p.name === name) {
        return true
      }
    })
    return false
  }


  if (checkDuplicateName(body.name)) {
    return response.status(400).json({
      error: 'name already in phonebook, lettersize does not matter'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
