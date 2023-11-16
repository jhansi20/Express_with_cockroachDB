const express = require('express');
var bodyParser=require('body-parser')
const app = express();
let customers=require('./temp.json');
const port = 3000;
const Joi=require('joi');
const pgp = require('pg-promise')();
const schemas=require('./schemas');
const middleware=require('./middleware');


const cn = {
    host: 'localhost',
    port: 26257,
    database: 'testdb',
    user: 'cockroach',
    password: '',
    max: 30
};

const db = pgp(cn);
db.connect();

async function existsUsername(id){
  const result= await db.oneOrNone('SELECT * FROM customers WHERE id=$1',id);
  if(result==null) return false;
  return true;
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/getAll', async (req, res) => {
    try {
      const result = await db.any('SELECT * FROM customers');
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
app.get('/getById/:id',middleware(schemas.custID,'params'),async(req,res)=>{
  try{
   const result=await db.oneOrNone('SELECT * FROM customers WHERE id=$1',parseInt(req.params.id));
   if(result){
   res.json(result);
   }
   else{
    res.send('Customer does not exist');
   }
  }
  catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/post',middleware(schemas.custPOST,'body'),async(req,res)=>{
    const {name,id}=req.body;
    const newCustomer={name,id};
  try{
    if(await existsUsername(id)){
    res.send('Customer already exists with same id');
    }
    else{
      await db.query(`INSERT INTO "customers" ("id", "name")  
      VALUES ($1, $2)`, [id, name]);
      res.status(201).send('Added new customer!');
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})
app.put('/update/:id',middleware(schemas.custPUT,'body'),middleware(schemas.custID,'params'),async(req,res)=>{
    const {body}=req;
    const {name}=req.body;
    const id=req.params.id;
    try{
      if(await existsUsername(parseInt(id))){
      await db.query(`UPDATE "customers" 
      SET "name" = $1 WHERE "id" = $2`, [name, id]);
      res.status(201).send('Updated the customer!');
      }
      else{
        res.send('Customer does not exist');
      }
    }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
})
app.delete('/delete/:id',middleware(schemas.custID,'params'),async(req,res)=>{
  const id=req.params.id;
  try{
    if(await existsUsername(parseInt(id))){
    await db.query(`DELETE FROM "customers" WHERE "id" = $1`, [id]);
      res.status(201).send('Deleted the customer!');
    }
    else{
      res.send('Customer does not exist');
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})