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


const Info = (personsInBook, dateTime) => {
  return (`<div>
    <p>Phonebook has info for ${personsInBook} people</p>
    <p>${dateTime}</p>
    </div>
    `
  )
}

app.get('/info', (request, response, next) => {
  const date = Date()
  Person.countDocuments({}).then(count => {
    response.send(Info(count, date))
  })
  .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(people => {
    response.json(people)
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
    .catch(error => next(error))
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
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name, 
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  }

  next(error)
}

app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
