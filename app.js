const express = require("express");
const path = require("path");
const cors = require("cors")

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname,"bookMySeat.db");
let db = null


const initialiseDBAndServer = async ()=>{
      try{
            db = await open({
                  filename: dbPath,
                  driver: sqlite3.Database
            })
            app.listen(5000, ()=>{
                  console.log("Server is running at http://localhost:5000")
            })
      }catch(e){
            console.log(`DB Error ${e.message}`)
            process.exit(1)
      }
}

initialiseDBAndServer()


app.post("/book-seat", async (request,response)=>{
      try{
            const {id,availability,seat,category} = request.body
            console.log(availability)
            const isBooked = `SELECT * FROM ticketbooking where seat = ${seat} and category="${category}"`
            const dbResponse = await db.get(isBooked)
            if (dbResponse === undefined){
                   const bookASeatQuery = `INSERT INTO 
                  ticketbooking(id,availability,seat,category)
                  VALUES(${id},"${availability}",${seat},"${category}");`
                  const dbResponse = await db.run(bookASeatQuery)
                  const lastId = dbResponse.lastID
                  response.send(`Seat has been booked ${seat}`)
            }else{
                  response.send("Unavailable")
            }
           
      }catch(error){
            response.send(error.message)
      }
});

app.get("/booked", async(request,response)=>{
      const getBookedSeats = `select * from ticketbooking where availability = "unvailable"`
      const dbResponse = await db.all(getBookedSeats)
      response.send(dbResponse)
})

app.get("/available-seats", async(request,response)=>{
       const getAvailableSeats = `select * from ticketbooking where availability = "available"`
      const dbResponse = await db.all(getAvailableSeats)
      response.send(dbResponse)
})


app.put("/book-seat/:id", async(request,response)=>{
      const {id} = request.params
      console.log(request.body)
      const {category,seat,availability} = request.body
      const updateSeat = `UPDATE ticketbooking SET availability="${availability}",category="${category}",seat=${seat} where id = ${id}`
      await db.run(updateSeat)
      const updatedRow = await db.get(`SELECT * FROM ticketbooking WHERE id = ${id}`);
      response.send(updatedRow);
})