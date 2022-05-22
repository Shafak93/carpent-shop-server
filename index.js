const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Carpent Running')
});



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cxu4p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const carpentCollection = client.db('carpent-shop').collection('products');

        //GET API all products
        app.get('/product', async (req, res) =>{
            const query = {};
            const cursor = carpentCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('Running port ', port)
})