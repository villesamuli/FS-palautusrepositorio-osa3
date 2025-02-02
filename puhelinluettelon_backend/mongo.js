const mongoose = require('mongoose')

if (process.argv.length<2) {
  console.log('give password as argument and optionally name and phonenumber as following arguments')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://villesamuli:${password}@cluster0.yky7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(people => {
    console.log('phonebook:')
    people.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  
  person.save().then(people => {
    console.log('Phonenumber saved!')
    mongoose.connection.close()
  })
}



