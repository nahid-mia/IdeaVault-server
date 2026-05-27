const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;



async function run() {
    try {
        // await client.connect();

        const db = client.db('ideaVault');
        const ideaCollection = db.collection('ideas');
        const myIdeaCollection = db.collection('myIdeas');
        const userCollection = db.collection('user');

        app.get('/ideas', async (req, res) => {
            try {
                const { search, category, dateFrom, dateTo } = req.query;

                const query = {};

                if (search) {
                    query.ideaTitle = { $regex: search, $options: 'i' };
                }

                if (category) {
                    query.category = category;
                }

                if (dateFrom || dateTo) {
                    query.createdAt = {};
                    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                    if (dateTo) query.createdAt.$lte = new Date(dateTo);
                }

                const result = await ideaCollection.find(query).toArray();
                res.json(result);
            } catch (error) {
                console.error('Error fetching ideas', error);
                res.status(500).send('Error fetching ideas');
            }
        });

        app.get('/ideas/featured', async (req, res) => {
            const result = await ideaCollection.find().limit(6).toArray();
            res.json(result);
        })

        app.get(`/ideas/:id`, async (req, res) => {
            const { id } = req.params;
            const result = await ideaCollection.find({ _id: new ObjectId(id) }).toArray();
            res.json(result);
        })


        app.post('/ideas', async (req, res) => {
            try {
                const result = await ideaCollection.insertOne(req.body);
                res.json(result)
            } catch (error) {
                res.status(500).json({ error: 'Something went wrong' })
            }
        })

        app.post(`/myIdeas`, async (req, res) => {
            try {
                const result = await myIdeaCollection.insertOne(req.body);
                res.json(result)
            } catch (error) {
                res.status(500).json({ error: 'Something went wrong' })
            }
        })


        app.get('/myIdeas/:id', async (req, res) => {
            const { id } = req.params;
            const result = await myIdeaCollection.find({ _id: new ObjectId(id) }).toArray();
            res.json(result);
        })

        app.get('/myIdeas/author/:id', async (req, res) => {
            const { id } = req.params;
            const result = await myIdeaCollection.find({ authorId: id }).toArray();
            res.json([...result]);
        });

        app.patch('/user/:id', async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;

            try {
                const result = await userCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: error.message });
            }
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})