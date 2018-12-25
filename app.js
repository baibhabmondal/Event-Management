const cred = require('./cred')
const express = require('express');
const bodyParser = require('body-parser');
const graphqlhttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const app = express();

mongoose.connect(`mongodb://${cred.user}:${cred.pass}@ds243054.mlab.com:43054/eventgraphql`, {
    useNewUrlParser: true
})
    .then((data) => { console.log("database set up") })
    .catch(err => { console.log(err) })

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/graphql', graphqlhttp({
    schema: buildSchema(`

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
            return Event.find()
            .exec()
            .then(data => {
                return data.map(event => {
                    return {...event._doc, _id: event._doc._id.toString()}
                })
            }).catch(err => {
                console.log(err)
                throw err;
            })
        },
        createEvents: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            })
            return event.save()
            .then(data => {
                console.log(data)
                return {...data._doc, _id: data._doc._id.toString()}
            }).catch(err => {
                console.log(err)
                throw err
            });
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.status(200).json({ msg: 'hey it works' });
})

const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`listening to ${port}`) });