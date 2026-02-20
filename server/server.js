import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import  connectDB  from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";



// create httpserver and app
const app = express();
const server = http.createServer(app)

//Initaialise socket.io server

export const io = new Server(server,{
    cors:{origin:"*"}
})
//store online users
export const userSocketMap = {}; //{userId: socketId}

//socket.io connectionhandler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user connected",userId);
    if(userId) userSocketMap[userId] = socket.id;

    //emit online users for all connected clients 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })

})


//Middleware setup
app.use(express.json({limit:"10mb"}));
app.use(cors());

//route setup
app.use("/api/status",(req,res)=>res.send("server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);



//connect to mongodb
await connectDB();

//define port number
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log("server is running on port"+PORT ));