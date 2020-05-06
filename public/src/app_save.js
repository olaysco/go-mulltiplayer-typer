//define arrays of words that would be picked randomly
const words = [
    'Analogy',
    'Independent',
    'Dependency',
    'Technology',
    'Advancement',
    'Provision',
    'Anchor',
    'Multitude',
    'Acrimony',
    'Tint',
    'Script',
    'Alight',
    'Random',
    'Manipulate',
    'Detect',
    'Respond',
    'Mutator',
    'Action',
    'Button',
    'Extend',
    'Inheritance',
    'Polymorphism',
    'Abstract',
    'Factory',
    'Elongate',
    'Phantom',
    'Wakanda',
    'Justify',
];


let elemTimeLeft = document.getElementById('timeLeft');
let elemScore = document.getElementById('score');
let elemTypedText = document.getElementById('typedText');
let elemSetTime = document.getElementById('setTime');
let elemCurrentText = document.getElementById('currentText');
let elemMessage = document.getElementById('message');
let elemBtnStart = document.getElementById('btn-start');
let levelTime = 10;
let playerActive = false;
let score = 0;

let changeText =()=>{
    elemCurrentText.innerHTML = words[Math.floor(Math.random() * words.length)];
}

let countDown = ()=>{
    if(levelTime >0 && playerActive){
        levelTime -= 1;
    }else{   
        playerActive = false;
        elemMessage.innerHTML = 'Game Over';
    }
    
    elemTimeLeft.innerHTML = levelTime;
}

let checkMatch = ()=>{
    if(elemTypedText.value === elemCurrentText.innerHTML){
        levelTime = 10;
        elemTimeLeft.innerHTML = levelTime;
        elemMessage.innerHTML = 'correct';
        elemTypedText.value = '';
        score++;
        elemScore.innerHTML = score;
        changeText();
    }   
}

let startAgain = ()=>{
    levelTime =10;
    changeText();
    score = 0;
    elemScore.innerHTML = score;
    elemTypedText.innerHTML = '';
    elemTypedText.focus();
    playerActive = true;
}

let initGame = ()=>{
    elemBtnStart.addEventListener('click',startAgain);
    elemTypedText.addEventListener('input', checkMatch);
    playerActive = true;
    changeText();
    setInterval(()=>{
        countDown();
    },1000);
    setInterval(()=>{
        elemMessage.innerHTML = (playerActive == false &&levelTime === 0)?'Game Over':'';
    },50)

}



window.addEventListener('load', initGame());