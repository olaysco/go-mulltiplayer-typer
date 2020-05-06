//define arrays of words that would be picked randomly
let words = [
  "Analogy",
  "Independent",
  "Dependency",
  "Technology",
  "Advancement",
  "Provision",
  "Anchor",
  "Multitude",
  "Acrimony",
  "Tint",
  "Script",
  "Alight",
  "Random",
  "Manipulate",
  "Detect",
  "Respond",
  "Mutator",
  "Action",
  "Button",
  "Extend",
  "Inheritance",
  "Polymorphism",
  "Abstract",
  "Factory",
  "Elongate",
  "Phantom",
  "Wakanda",
  "Justify",
];
let elemTimeLeft = document.getElementById("timeLeft");
let elemScore = document.getElementById("score");
let elemTypedText = document.getElementById("typedText");
let elemSetTime = document.getElementById("setTime");
let elemCurrentText = document.getElementById("currentText");
let elemMessage = document.getElementById("message");
let elemView = document.documentElement;
let elemModal = document.getElementById("startModal");
let elemCloseModal = document.getElementsByClassName("btn-close")[0];
let elemBtnCreate = document.getElementById("createGame");
let elemBtnJoin = document.getElementById("joinGame");
let elemBtnStart = document.querySelector(".btnStart");
let elemJoinName = document.getElementById("joinName");
let elemJoinId = document.getElementById("joinId");
let elemCreateName = document.getElementById("createName");
let elemInitRow = document.querySelector(".initRow");
let elemJoinRow = document.querySelector(".joinRow");
let elemCreateRow = document.querySelector(".createRow");
let elemTimerRow = document.querySelector(".timerRow");
let elemNewGameId = document.querySelector(".gameId i");
let elemWaitingCount = document.querySelectorAll(".waitingPlayerCount");
let elemJoinError = document.querySelector(".joinError");
let elemTimer = document.querySelector(".timer");
let elemWordTimer = document.querySelector(".word-timer");
let elemGameTimer = document.querySelector(".main-timer #seconds");
let elemEndModal = document.getElementById("endModal");
let elemScoresheet = document.querySelector(".score-sheet");
let scoreTemplate = (player) => {
  if (mp.id === player.ID) {
    return `<div> <b>ME : </b> <span>${player.Score}</span> </div>`;
  }
  return `<div> <b>${player.Username}: </b> <span>${player.Score}</span> </div>`;
};

let levelTime = 10;
let gameTime = 60;
let playerActive = false;
let score = 0;
let mp = null;

let changeText = () => {
  elemCurrentText.innerHTML = words[Math.floor(Math.random() * words.length)];
  elemWordTimer.setAttribute("progress", 0);
};

let countDown = () => {
  if (levelTime > 0 && playerActive) {
    const progress = parseInt(elemWordTimer.getAttribute("progress")) + 10;
    elemWordTimer.setAttribute("progress", progress);
    levelTime -= 1;
  } else if (playerActive) {
    levelTime = 9;
    changeText();
  } else {
    gameOver();
  }
};

let checkMatch = () => {
  if (
    strToLower(elemTypedText.value) === strToLower(elemCurrentText.innerHTML) &&
    playerActive
  ) {
    levelTime = 10;
    elemTypedText.value = "";
    score++;
    mp.newScore(score);
    elemScore.innerHTML = score;
    changeText();
  }
};

let gameOver = function () {
  playerActive = false;
  levelTime = 0;
  elemMessage.innerHTML = "Game Over";
  show(elemEndModal);
  mp.playerList.forEach((player) => {
    elemScoresheet.innerHTML = elemScoresheet.innerHTML + scoreTemplate(player);
  });
};

let startAgain = () => {
  levelTime = 10;
  changeText();
  score = 0;
  elemScore.innerHTML = score;
  elemTypedText.innerHTML = "";
  elemTypedText.focus();
  playerActive = true;
};

let initGame = () => {
  elemBtnStart.addEventListener("click", startAgain);
  elemTypedText.addEventListener("input", checkMatch);
  mp.onNewScore(function (payload) {
    mp.updatePlayerScore(payload);
  });
  playerActive = true;
  changeText();
  const si = setInterval(() => {
    countDown();
    elemGameTimer.innerHTML = gameTime -= 1;
    if (gameTime <= 0) {
      gameOver();
      clearInterval(si);
    }
  }, 1000);
  setInterval(() => {
    elemMessage.innerHTML =
      playerActive == false && levelTime === 0 ? "Game Over" : "";
  }, 50);
};

let playersChanged = (players) => {
  elemWaitingCount.forEach((e) => (e.innerHTML = players.length));
};

let created = (payload) => {
  elemNewGameId.innerHTML = payload.data.room.ID;
  hideAndShow(elemInitRow, elemCreateRow);
};

let joined = (payload) => {
  hideAndShow(elemInitRow, elemJoinRow);
};

let startGame = () => {};

let startTimer = function () {
  const interval = setInterval(() => {
    const progress = parseInt(elemTimer.getAttribute("progress")) + 20;
    elemTimer.setAttribute("progress", progress);
    if (progress === 100) {
      clearInterval(interval);
      elemModal.style.display = "none";
      initGame();
    }
  }, 2000);
};

let join = function () {
  elemBtnJoin.disabled = true;
  mp.join(elemJoinId.value, elemJoinName.value)
    .then((res) => {
      mp.onNewPlayer();
      mp.onStarted((data) => {
        hideAndShow(elemJoinRow, elemTimerRow);
        startTimer();
      });
      joined(res);
    })
    .catch((e) => {
      show(elemJoinError);
    })
    .finally((e) => {
      elemBtnJoin.disabled = false;
    });
};

let create = function () {
  mp.create(elemCreateName.value);
  mp.onCreated(created);
  mp.onNewPlayer();
};

elemBtnStart.onclick = function () {
  hide(elemCreateRow);
  mp.start()
    .then((res) => {
      show(elemTimerRow);
      startTimer();
    })
    .catch((e) => {
      alert("error starting");
    });
};

elemBtnCreate.onclick = function () {
  if (!validateFields(elemCreateName)) return;
  if (mp === null) {
    mp = new Multiplayer();
    mp.addPlayerChangedListener(playersChanged);
    mp.onReady(create);
    return;
  }
  create();
};

elemBtnJoin.onclick = function () {
  if (!validateFields(elemJoinName, elemJoinId)) return;
  if (mp === null) {
    mp = new Multiplayer();
    mp.addPlayerChangedListener(playersChanged);
    mp.onReady(join);
    return;
  }
  join();
};
