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



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        //Get API For individual Product
        app.get('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await carpentCollection.findOne(query);
            console.log(product)
            res.send(product);
        })
        //PUT API : Update Purchase Product
        app.put('/product/:id', async (req, res) =>{
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = {_id : ObjectId(id)};
            const options = {upsert : true};
            const updateDoc = {
                $set: {
                    availableProduct : updatedProduct.availableProduct 
                }
            };
            const result = await carpentCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('Running port ', port)
})