const express = require("express");
const app = express();
const {Server} = require("socket.io");
const PORT = 999;
const LOCATION = "/player";


const CIRCLE = 0;
const CROSS = 1;

const IMAGES = ["images/combination.jpg", "images/YMPEK.jpg"];

const CIRCLE_OBJ = {
    message: "You are: <span class='sign'>CIRCLE</span>",
    sign: CIRCLE
};

const CROSS_OBJ = {
    message: "You are: <span class='sign'>CROSS</span>",
    sign: CROSS
};

const http = require("http");
const path = require("path");

const server = http.createServer(app);

let io = new Server(server);
let sockets = [];

let fields = [null, null, null, null, null, null, null, null, null];
let turn = 0;

io.on("connection", function(socket){
    socket.on("disconnect", function(){
        fields = [null, null, null, null, null, null, null, null, null];
        turn = 0;

        let index = sockets.indexOf(socket);
        sockets.splice(index, 1);
    });

    sockets.push(socket);

    if(sockets.length >= 2){
        sockets[0].emit("sign", CIRCLE_OBJ);
        sockets[1].emit("sign", CROSS_OBJ);
    }

    socket.on("choosedField", function(choiceInfo){
        if(choiceInfo.sign == turn){
            updateField(choiceInfo.fieldId, choiceInfo.sign);
        }
        else return;
    });
});

function updateField(fieldId, sign){
    if(fields[fieldId] == null){
        fields[fieldId] = sign;

        let imgInfo = {
            field: `field${fieldId}`,
            src: IMAGES[sign]
        };

        sockets[0].emit("insertImg", imgInfo);
        sockets[1].emit("insertImg", imgInfo);

        checkWin();
        changeTurn();
    }
    else return;
    // console.log(fields);
}

function checkWin(){
    let firstIndex = 0;
    let emptyFields = 0;

    for(let i = 0; i < 3; i++){
        if(fields[firstIndex] == fields[firstIndex + 1] && fields[firstIndex + 1] == fields[firstIndex + 2] && fields[firstIndex] != null)return win(fields[firstIndex]);
        if(fields[i] == fields[i + 3] && fields[i + 3] == fields[i + 6] && fields[i] != null)return win(fields[i]);
        firstIndex += 3;
    }

    if(fields[0] == fields[4] && fields[4] == fields[8] && fields[0] != null)return win(fields[0]);
    if(fields[2] == fields[4] && fields[4] == fields[6] && fields[2] != null)return win(fields[2]);

    for(let field of fields){
        if(field == null)emptyFields++;
    }

    if(emptyFields == 0)draw();
}

function win(winner){
    if(winner == CIRCLE)sockets[0].emit("win", "You won the game!");
    else sockets[1].emit("win", "You won the game!");
}

function draw(){
    sockets[0].emit("draw", "Draw!");
    sockets[1].emit("draw", "Draw!");
}

function changeTurn(){
    if(turn == CIRCLE)turn = CROSS;
    else turn = CIRCLE;
}

app.use(express.static(path.join(__dirname + LOCATION)));

server.listen(PORT, function(){});