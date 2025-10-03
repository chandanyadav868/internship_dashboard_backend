import { app } from "@/app"
import {databaseConnection} from "@/database/mongodb"
import dotenv from "dotenv"

// this setup for the loading environtment variable
dotenv.config({
    path: ".env"
})

const port = process.env.PORT

databaseConnection()
.then((res)=>{
    console.log(`MongoDb Connection Established ${res.connections[0]?.host}`);

    app.listen(3000,()=>{
        console.log(`Your backend is being listen on Port http://localhost:${port}`);
    })

})
.catch((error)=>{
    console.log(`Error in Mongodb Connection:- ${error.message}`);
})