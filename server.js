const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))

let leaders = [];
let currentPlayers;
let board = [];
let turn = '';

app.get('/api/leaders', (req, res) => {
  res.send(leaders);
});

app.get('/api/turn', (req, res) => {
  res.send(turn);
});

app.get('/api/clear', (req, res) => {
  leaders = [];
  res.send(leaders);
});

app.get('/api/ingame', (req,res) => {
  let data;
  if(!currentPlayers){
    data = {in: false, one:'', two:'', board: [], turn:'', leaders: leaders}
  }
  else{
    data = {in: true, one: currentPlayers.playerOne, two: currentPlayers.playerTwo, board: board, turn: turn, leaders: leaders}
  }
  res.send(data);
})

app.post('/api/addLeader', (req, res) => {
  let leader = req.body.leader;
  let changed = false;
  for(let i = 0; i < leaders.length; i++){
    if(leaders[i].name === leader){
      leaders[i].score++;
      changed = true;
    }
  }
  if (!changed){
    leaders.push({name: leader, score:1});
  }
  leaders.sort((a,b)=>{
    return a.score < b.score;
  });
  res.send(leaders);
});

app.post('/api/new', (req, res) => {
  currentPlayers = {playerOne:req.body.playerOne, playerTwo:req.body.playerTwo};
  currentPlayers.playerOne = currentPlayers.playerOne.charAt(0).toUpperCase() + currentPlayers.playerOne.substr(1);
  currentPlayers.playerTwo = currentPlayers.playerTwo.charAt(0).toUpperCase() + currentPlayers.playerTwo.substr(1);
  board = [];
  for(let i = 0; i < 42; i++){
    let square = {id:i, owner: 0};
    board.push(square);
  }
  turn = currentPlayers.playerOne;
  res.send({one:currentPlayers.playerOne, two:currentPlayers.playerTwo, board:board, turn:turn});
});

app.post('/api/takeTurn', (req, res) => {
  if(req.body.square >= 0){
    let player = currentPlayers.playerTwo;
    if(req.body.player === 1){
      player = currentPlayers.playerOne;
    }
    if(board[req.body.square].owner === 0 && player === turn){
      board[req.body.square].owner = req.body.player;
      if (turn === currentPlayers.playerOne){
        turn = currentPlayers.playerTwo;
      }else{
        turn = currentPlayers.playerOne;
      }
    }
  }
  res.send({board:board, turn:turn});
});

app.get('/api/checkwin', (req, res) => {
  let winner = 0;
  let rows = [[0,1,2,3,4,5,6],[7,8,9,10,11,12,13],[14,15,16,17,18,19,20],
     [21,22,23,24,25,26,27],[28,29,30,31,32,33,34],[35,36,37,38,39,40,41]];
  let columns = [[0,7,14,21,28,35], [1,8,15,22,29,36], [2,9,16,23,30,37],
     [3,10,17,24,31,38], [4,11,18,25,32,39],[5,12,19,26,33,40],[6,13,20,27,34,41]];
  let leftdiagonals = [[3,11,19,27],[2,10,18,26,34],[1,9,17,25,33,41],[0,8,16,24,32,40],[7,15,23,31,39],[14,22,30,38]];
  let rightdiagonals =[[3,9,15,21],[4,10,16,22,28],[5,11,17,23,29,35],[6,12,18,24,30,36],[13,19,25,31,37],[20,26,32,38]];
  let total = rows.concat(columns.concat(leftdiagonals.concat(rightdiagonals)));
  for(let i = 0; i < total.length; i++){
    let list = total[i];
    let p1 = 0;
    let p2 = 0;
    for(let s = 0; s < list.length; s++){
      if(board[list[s]].owner === 1){
        p1++;
        p2 = 0;
      }
      else if(board[list[s]].owner === 2){
        p2++;
        p1 = 0;
      }
      else{
        p1 = 0;
        p2 = 0;
      }
      if (p2 > 3) {
        winner = 2;
        break;
      }
      if(p1 > 3){
        winner = 1;
        break;
      }
    }
  }
  if(winner!= 0){
    currentPlayers = '';
    turn = '';
    board = '';
  }
  res.send({winner:winner});
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
