const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message: 'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
      if(err){
        return res.status(403).send({message: 'Forbidden access'})
      }
      req.decoded = decoded;
      next();
    });
  }

async function run(){
    try{
        await client.connect();
        const carpentCollection = client.db('carpent-shop').collection('products');
        const purchaseCollection = client.db('carpent-shop').collection('purchase');
        const userCollection = client.db('carpent-shop').collection('users');

        //GET API all products
        app.get('/product', async (req, res) =>{
            const query = {};
            const cursor = carpentCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        //GET API for all users
        app.get('/user', async(req, res)=>{
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        //PUT API for user admin
        app.put('/user/admin/:email',  async(req, res)=>{
            const email = req.params.email;
            // const user = req.body;
            const filter = {email : email};
            
            const updateDoc = {
                $set: {roll : 'admin'},
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        //PUT API for user
        app.put('/user/:email',  async(req, res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email : email};
            const options = {upsert : true};
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email },process.env.ACCESS_TOKEN,{expiresIn:'1h'});
            res.send({result, token});
        })
        
        //Get API For individual Product
        app.get('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await carpentCollection.findOne(query);
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
        //Purchasing API for inserting product

        app.post('/purchasing', async(req, res)=>{
            const newProduct = req.body;
            const result = await purchaseCollection.insertOne(newProduct);
            res.send(result);
        })
        // GET api for purchasing product
        app.get('/purchasing', verifyJWT, async (req, res) =>{
            const email = req.query.userEmail
            const decodedEmail = req.decoded.email;
            if(email === decodedEmail){
                const query = {userEmail: email};
                const purchasings = await purchaseCollection.find(query).toArray();
                res.send(purchasings);
            }else{
                return res.status(403).send({message: 'forbidden access'})
              }
            // const authorization = req.headers.authorization;
            
        })
        // app.post('/purchasing', async(req, res)=>{
        //     const purchasing = req.body;
        //     const query = {
        //         user : purchasing.userName ,
        //         email : purchasing.userEmail,
        //         phone : purchasing.phone,
        //         address : purchasing.address,
        //         orderQuantity : purchasing.orderQuantity,
        //         productName : purchasing.name
        //     }
        //     const exists = await purchaseCollection.findOne(query);
        //      if(exists){
        //       return res.send({success : false, purchasing: exists})
        //      }
        //      const result = await purchaseCollection.insertOne(purchasing)
        //      res.send({success: true, result});
  
        //   })

        
    }
    finally{

    }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('Running port ', port)
})