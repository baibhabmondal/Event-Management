const cred = require('./cred')
const express = require('express');
const bodyParser = require('body-parser');
const graphqlhttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(`mongodb://${cred.user}:${cred.pass}@ds243054.mlab.com:43054/eventgraphql`, {
  useNewUrlParser: true
})
  .then((data) => { console.log("database set up") })
  .catch(err => { console.log(err) })

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const events = [];

app.use('/graphql', graphqlhttp({
    schema : buildSchema(`

        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type rootQuery {
            events: [Event!]!
        }

        type rootMutation {
            createEvents(eventInput: EventInput): Event
        }

        schema {
            query: rootQuery,
            mutation: rootMutation
        }
    `),
    // this acts as a resolver functions
    rootValue: {
        events: () => {
            return events
        },
        createEvents: (args) => {
            const event =  {
              _id: Math.random().toString(),
              title: args.eventInput.title,
              description: args.eventInput.description,
              price: +args.eventInput.price,
              date: new Date().toISOString()
            }
            console.log(args)
            events.push(event)
            return event
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.status(200).json({msg: 'hey it works'});
})

const port = process.env.PORT || 3000
app.listen(port, () => {console.log(`listening to ${port}`)});