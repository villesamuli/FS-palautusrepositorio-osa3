const express = require('express')
var morgan = require('morgan')
morgan.token('body', function (req, res) { return JSON.stringify(req.body)})
const morganLogFormat = ':method :url :status :res[content-length] - :response-time ms :body'

const app = express()

app.use(express.json())
app.use(morgan(morganLogFormat))

let persons = [
    {
      id: "1",
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: "2",
      name: "Ada Lovelace",
      number: "39-44-5323523"
    },
    {
      id: "3",
      name: "Dan Abramov",
      number: "12-43-234345"
    },
    {
      id: "4",
      name: "Mary Poppendieck",
      number: "39-23-6423122"
    }
]

const Info = (personsInBook, dateTime) => {
  return (`<div>
    <p>Phonebook has info for ${personsInBook} people</p>
    <p>${dateTime}</p>
    </div>
    `
  )
}

app.get('/info', (request, response) => {
  const personsInBook = persons.length
  const date = Date()
  response.send(Info(personsInBook, date))
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random() * 100000)
}

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
    const value = persons.find(p => p.name.toLowerCase() === name.toLowerCase())
    return value
  }

  if (checkDuplicateName(body.name)) {
    return response.status(400).json({
      error: 'name already in phonebook, lettersize does not matter'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat(person)

  response.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)