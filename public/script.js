var app = new Vue({
  el: '#app',
  data: {
    inGame: false,
    leaders: [],
    playerOne:'',
    playerTwo: '',
    board: [],
    turn: '',
  },
  computed: {
    getPlayerNumber: function(){
      if(this.turn === this.playerOne){
        return 1;
      }
      if(this.turn === this.playerTwo){
        return 2;
      }
      return 0;
    }
  },
  created: function() {
    this.getGame();
  },
  methods: {
    getGame: function(){
      axios.get("/api/ingame").then(response =>{
        this.inGame = response.data.in;
        this.playerOne = response.data.one;
        this.playerTwo = response.data.two;
        this.board = response.data.board;
        this.turn = response.data.turn;
        this.leaders = response.data.leaders;
      }).catch(err => {});
    },
    getLeaders: function(){
      axios.get("/api/leaders").then(response => {
        this.leaders = response.data;
        return true;
      }).catch(err => {});
    },
   startGame: function(){
     if (!this.playerOne || !this.playerTwo){
       alert("Please enter Player One and Player Two!");
     }
     else {
       this.inGame = true;
       axios.post("/api/new", {
         playerOne: this.playerOne,
         playerTwo: this.playerTwo
       }).then(response =>{
         this.board = response.data.board;
         this.turn = response.data.turn;
         this.playerOne = response.data.one;
         this.playerTwo = response.data.two;
         return true;
       }).catch(err => {});
     }
   },
   handleClick: function(id) {
     let col = this.getColumn(id);
     let square = this.getRow(col);
     axios.post("/api/takeTurn", {
       player: this.getPlayerNumber,
       square: square,
     }).then(response =>{
       this.board = response.data.board;
       this.turn = response.data.turn;
       return true;
     }).catch(err => {});
     this.checkWin();
   },
   getColumn: function(id){
     let columns = [[0,7,14,21,28,35], [1,8,15,22,29,36],
      [2,9,16,23,30,37], [3,10,17,24,31,38], [4,11,18,25,32,39],[5,12,19,26,33,40],[6,13,20,27,34,41]];
     for(let i = 0; i < columns.length; i++){
       let sublist = columns[i];
       if (sublist.includes(id)){
         return i;
       }
     }
     return -1;
   },
   getRow: function(col){
     let rows = [[0,7,14,21,28,35], [1,8,15,22,29,36],
      [2,9,16,23,30,37], [3,10,17,24,31,38], [4,11,18,25,32,39],[5,12,19,26,33,40],[6,13,20,27,34,41]];
     let sublist = rows[col];
     for(let i = sublist.length-1; i >= 0; i--){
       let square = this.board[sublist[i]];
       if(square.owner === 0){
         return sublist[i];
       }
     }
     return -1;
   },
   checkWin: function(){
     axios.get("/api/checkwin").then(response => {
       if(response.data.winner !== 0){
         let winner = this.playerOne;
         if(response.data.winner === 2){
           winner = this.playerTwo;
         }
         this.board = [];
         this.inGame = false;
         alert(winner +" is the winner! 4 in a row!");
         axios.post("/api/addLeader", {
           leader: winner,
         }).then(response =>{
           this.leaders = response.data;
         }).catch(err =>{});
       }
       return true;
     }).catch(err => {});
   },
   clearLeader: function(){
     axios.get("/api/clear").then(response => {
       this.leaders = response.data;
     }).catch(err =>{});
   }
  },
});
