const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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