const cred = require('./cred')
const express = require('express');
const bodyParser = require('body-parser');
const graphqlhttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('./models/event');
const User = require('./models/user');
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
            creator: User!
        }

        type User {
            _uid: ID!
            email: String!
            password: String
            createdEvent: [Event]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type rootQuery {
            events: [Event!]!
            users: [User!]!
        }

        type rootMutation {
            createEvents(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
        users: () => {
            return User.find()
                .exec()
                .then(data => {
                    return data.map(user => {
                        return { ...user._doc, _id: user._doc._id.toString()}
                    })
                })
                .catch(err => {
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
        },
        createUser: (args) => {
            return bcrypt.hash(args.userInput.password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save()
                    .then(data => {
                        return { ...data._doc, _uid: data._doc._id.toString() }
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.status(200).json({ msg: 'hey it works' });
})

const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`listening to ${port}`) });