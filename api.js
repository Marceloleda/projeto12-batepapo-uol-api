import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();

const api = express();

api.use(cors());
api.use(express.json());

const mongoClient  = new MongoClient(process.env.MONGO_URI);
let db;


mongoClient.connect().then(()=>{
  db = mongoClient.db("batepapouol")
})

const useSchema = Joi.object({
  name: Joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/).required()
})

const textSchema = Joi.object({
  to: Joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/).required(),
  text: Joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/).required()

})

api.post("/participants", async (req, res)=>{
  const {name} = req.body;


  const validation = useSchema.validate(req.body);
  console.log(validation)
  try{
    if(validation.error){
      res.status(422).send(error.message);
      return  
    }
  }catch(error){
    res.status(422).send(error.message);
    return  
  }

  try{
    const igual = await db.collection("participantes").findOne({
      name: `${name}`
    })

    if(igual){
      res.status(409).send(error);
      return 
    }
  }catch(error){
    res.status(409).send(error);
    return 
  }
  const today=new Date();
  const h= today.getHours();
  const m= today.getMinutes();
  const s= today.getSeconds();
  
  try{
    const {from, to, text, type, time} = req.body;
    await db.collection("participante").insertOne({
      from, 
      to, 
      text, 
      type, 
      time: `${h}:${m}:${s}`
    })
    const tempo = Date.now();
    await db.collection("participantes").insertOne({
      name,
      lastStatus: `${tempo}`
    })

    res.status(201).send("created")

  }catch(error){
    res.status(422)      
  }
  
})


api.get("/participants", async (req, res)=>{

  try{
    const participantes = await db.collection("participantes").find().toArray()
    console.log(participantes)
    res.send(participantes)
  }catch(error){
    res.status(422).send(error)
    return
  }
})

api.get("/messages", async (req, res)=>{
  const {to, text, type} = req.body;

  res.send({
    to,
    text, 
    type
  })
  const validate = textSchema.validate(req.body);
 
  try{

    const user = req.headers;
    console.log(user)
  }catch(error){
    res.status(422).send(error)
  }
})

api.listen(5000, ()=> console.log("listening on port 5000"))