const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    console.log('hello')
    res.send('hello')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8mn4lkn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("coffeeDB");
        const coffeeCollection = database.collection("coffee");
        const userCollection = database.collection('users')


        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body
            const result = await coffeeCollection.insertOne(newCoffee)
            res.send(result)

        })

        app.get('/coffees', async (req, res) => {

            const cursor = coffeeCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query)
            res.send(result)
        })

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id
            const update = req.body

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateCoffee = {
                $set: {
                    name: update.name,
                    details: update.details,
                    chef: update.chef,
                    supplier: update.supplier,
                    taste: update.taste,
                    category: update.category,
                    photo: update.photo,
                },
            };
            const result = await coffeeCollection.updateOne(filter, updateCoffee, options)
            res.send(result)

        })


        app.delete('/coffees/:id', async (req, res) => {

            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query)
            res.send(result)
        })

        // user setup with database

        app.post('/user', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.get('/user', async (req, res) => {
            const query = userCollection.find()
            const result = await query.toArray()
            res.send(result)
        })

        app.get('/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(query)
        })


        app.patch('/user', async (req, res) => {
            const user = req.body

            const filter = { email: user.email }

            const updateUser = {
                $set: {
                    lastSignInTime: user.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, updateUser)
            res.send(result)


        })



        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`server running on port ${port}`)
})