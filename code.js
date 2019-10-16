//Copyright Baker Franke - Code.org Sept. 2016

var rowList = [];
var rowIds = 0;
var score = 0;
var level = 4; //roughly, the number of bits used in bit string.
var interval = 4000;
var timerId;
var numCorrectOnLevel = 0;
var GAMEOVER = false;

getKeyValue("hitCount", function (value) {
  setKeyValue("hitCount", value+1);
  setText("visits","Page Visits: "+(value+1));
});


function setup(){
  makePow2Labels();
}



function reset(){
  GAMEOVER = false;
  hideElement("gameOver");
  deleteAll();
  rowList = [];
  interval = 4000;
  score = 0;
  level = 4;
  numCorrectOnLevel=0;
  
  addRow(level);
  addRow(level);
  addRow(level);
  go();
}

function go(){
  timerId = setTimeout(function(){
    addRow(level);
    if(!GAMEOVER){
      go();
    }
    console.log(interval);
  }, interval);
}

function update(){
  //console.log("UPDATE: "+JSON.stringify(rowList));
  
  var beforeLen = rowList.length;
  var numRemoved = removeAllCorrect();
  if(numRemoved > 0 && Object.keys(rowList).length===0){
    addRow(level);
  }
  
  var nextY = 390;
  for(var id in rowList){
    //console.log(id);
    setPosition(id, 0, nextY);
    nextY -= 35;
  }
  
  
  //update score
  updateScore();
  
  if(Object.keys(rowList).length>=10){
    showElement("gameOver");
    setStyle("gameOver","z-index: 9999");
    GAMEOVER = true;
  }
  
  
  
}

function updateScore(){
  
  setText("score","Score: "+score);

  if(numCorrectOnLevel >= 10){
    level++;
    level = Math.min(level, 8);
    numCorrectOnLevel=0;
  }  
  
  setText("level","Level: "+level);
  
  interval = level*1000;
  if(randomNumber(0,100)<20){
    interval = level*100;
  }
}

function deleteAll(){
   for(var id in rowList){
       deleteElement(id);
       
     
  }
}
function removeAllCorrect(){
  var count = 0;
  for(var id in rowList){
     if(rowList[id].isCorrect()){
       score += level*10;
       numCorrectOnLevel++;
       //deleteElement(id);
       setPosition(id,-500, getYPosition(id));
       delete rowList[id];
       count++;
     }
  }
  return count;
}



function addRow(numBits){
  var newId = "BinaryRow"+rowIds;
  rowIds++;
  var row = makeRowWithId(newId, numBits);
  
  rowList[newId]=row;
  update();
  
}



function randomBinString(numBits){
  //numBits is the max high order bit that can be set.  e.g. if numBits==4
  // Then max bin string is 00001111
  var arr = [0,0,0,0,0,0,0,0];
  for(var i=0; i<8; i++){
    if(i >= 8-numBits){
      arr[i] = randomNumber(0,1);
      
    }
  }
  //console.log("randomBinString("+numBits+") -->"+JSON.stringify(arr));
  return arr;
  
}



function makeRowWithId(htmlID, numBits, probType){
  var binRow = {}
  binRow.binString = randomBinString(numBits);

  binRow.id = htmlID;
  
  if(probType===undefined){
    binRow.problemType = "dec2bin"
    if(randomNumber(0,10)<6){
      binRow.problemType = "bin2dec";
    }
  }
  else{
    binRow.problemType = probType;
  }
  
  
  makeButtonsForRow(binRow);
  
  
  binRow.isCorrect = function(){
    
    //return true and delete/hide row iff binString matches text in textbox.
    var binNum = parseInt((this.binString.toString().replace(/[,]/g,"")),2);
    var textBoxNum = getNumber(this.id+"_decVal");
    
    return binNum===textBoxNum;
  }

  binRow.toggleBit = function(n){
    
    if(this.problemType==="dec2bin"){
      return; //no toggling if we're trying to type the dec number
    }
    
    this.binString[n]=(this.binString[n]+1)%2;
    this.updateButtonText();
    
    update();
  }
  
  binRow.updateButtonText = function(){
    for(var i=0; i<8; i++){
      var butId = this.id+"_"+i;
      setText(butId, this.binString[i]);
      var color = "rgb(174,29,81)";
      if(this.binString[i]===0){ 
        color = "rgb(244,141,16)";
      }
      setStyle(butId, "background-color: "+color);
    }
    update();
  }
  binRow.updateButtonText();

  

  return binRow;
}

function makePow2Labels(){
  var id = "pow2_"
   for(var i=7; i>=0; i--){
     textLabel(id+i,Math.pow(2,i));
     setPosition(id+i, (7-i)*29, 425, 30, 20);
     setStyle(id+i,"text-align: center; color: white; border-right: solid 1px #999999; padding: 1px; color: #DDFFDD; font-family: monospace");
   }
}

function makeButtonsForRow(row){
   

  textLabel(row.id,"");
  setPosition(row.id, 0, 100); 
  setStyle(row.id, "transition: top 1s, left 0.5s;");
  for(var i=0; i<8; i++){
    var butId = row.id+"_"+i;
    button(butId, row.binString[i]);
    setStyle(butId,"width: 25px; height: 30px; margin: 2px; padding: 1px; border-radius: 3px");
    setParent(butId, row.id);
    
    onEvent(butId, "click", function(event){
      var bitNum = (event.srcElementId.split("_"))[1]
      row.toggleBit(bitNum); 
    });
    
  }
  
  if(row.problemType=="bin2dec"){
    row.binString = [0,0,0,0,0,0,0,0];
    textLabel(row.id+"_decVal", randomNumber(0,Math.pow(2,level)));
    setStyle(row.id+"_decVal", "background-color: rgba(255,255,255,0.25); text-align: center; padding-top: 5px");
  }
  else{
    textInput(row.id+"_decVal", "");
    setStyle(row.id+"_decVal","background-color: rgba(200,255,200,0.5)");
    
  }
  setStyle(row.id+"_decVal","width: 50px; height: 30px; margin: 2px; color: white; border: solid 1px #999999");
  setParent(row.id+"_decVal", row.id);
 
  onEvent(row.id+"_decVal", "change", function(){
    update();
  });
  
}

onEvent("gameOver", "click", function(event) {
  console.log("gameOver clicked!");
  reset();
});
onEvent("button1", "click", function(event) {
  setScreen("screen1");
  setup();
  reset();
});
