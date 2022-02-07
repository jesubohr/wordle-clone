import {targetWords, dictionary } from './data.js'

const alertContainer = document.querySelector('[data-alert-container]');
const guessGrid = document.querySelector('[data-guess-grid]');
const keyboard = document.querySelector('[data-keyboard]');

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];


function startInteraction () {
   document.addEventListener('click', handleMouseClick);
   document.addEventListener('keydown', handleKeyPress);
}
function stopInteraction () {
   document.removeEventListener('click', handleMouseClick);
   document.removeEventListener('keydown', handleKeyPress);
}

function handleMouseClick (ev) {
   if (ev.target.matches('[data-key]')) {
      pressKey(ev.target.dataset.key);
      return;
   }

   if (ev.target.matches('[data-enter]')) {
      submitGuess();
      return;
   }

   if (ev.target.matches('[data-delete]')) {
      deleteKey();
      return;
   }
}
function handleKeyPress (ev) {
   if (ev.key === 'Enter') {
      submitGuess();
      return;
   }

   if (ev.key === 'Backspace' || ev.key === 'Delete') {
      deleteKey();
      return;
   }

   if (ev.key.match(/^[a-zA-Z]$/)) {
      pressKey(ev.key);
      return;
   }
}

function getActiveTiles () {
   return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert (message, duration = 1000) {
   const alert = document.createElement('span');
   alert.textContent = message;
   alert.classList.add('alert');
   alertContainer.prepend(alert);

   if (duration === null) return;
   setTimeout(() => {
      alert.classList.add('hide');
      alert.addEventListener('transitionend', () => {
         alert.remove();
      });
   }, duration);
}

function shakeTiles (tiles) {
   tiles.forEach((tile) => {
      tile.classList.add('shake');
      tile.addEventListener('animationend', () => {
         tile.classList.remove('shake');
      }, { once: true });
   });
}

function flipTile (tile, index, array, guess) {
   const letter = tile.dataset.letter;
   const key = keyboard.querySelector(`[data-key="${letter}"i]`);

   setTimeout(() => {
      tile.classList.add('flip');
   }, (index * FLIP_ANIMATION_DURATION) / 2);

   tile.addEventListener('transitionend', () => {
      tile.classList.remove('flip');
      if (targetWord[index] === letter) {
         tile.dataset.state = 'correct';
         key.classList.add('correct');
      } else if (targetWord.includes(letter)) {
         tile.dataset.state = 'wrong-location';
         key.classList.add('wrong-location');
      } else {
         tile.dataset.state = 'wrong';
         key.classList.add('wrong');
      }

      if (index === array.length - 1) {
         tile.addEventListener('transitionend', () => {
            startInteraction();
            checkWinLose(guess, array);
         }, { once: true });
      }
   }, { once: true });
}

function danceTiles (tiles) {
   tiles.forEach((tile, index) => {
      setTimeout(() => {
         tile.classList.add('dance');
         tile.addEventListener('animationend', () => {
            tile.classList.remove('dance');
         }, { once: true });
      }, (index * DANCE_ANIMATION_DURATION) / 5);
   });
}

function checkWinLose (guess, tiles) {
   if (guess === targetWord) {
      showAlert('You Win🎉', 5000);
      danceTiles(tiles);
      stopInteraction();
      return;
   }

   const remainingTiles = guessGrid.querySelectorAll(':not([data-state])');
   if (remainingTiles.length === 0) {
      showAlert(`You Lose😞 -> Word: ${targetWord.toUpperCase()}`, null);
      stopInteraction();
      return;
   }
}

function pressKey (key) {
   const activeTiles = getActiveTiles();
   if (activeTiles.length >= WORD_LENGTH) return;

   const nextTile = guessGrid.querySelector(':not([data-letter])');
   nextTile.dataset.letter = key.toLowerCase();
   nextTile.textContent = key;
   nextTile.dataset.state = 'active';
}

function submitGuess () {
   const activeTiles = [...getActiveTiles()];
   if (activeTiles.length !== WORD_LENGTH) {
      showAlert('Not enough letters');
      shakeTiles(activeTiles);
      return;
   }

   const guess = activeTiles.reduce((word, tile) => {
      return word + tile.dataset.letter;
   }, '');

   if (!dictionary.includes(guess)) {
      showAlert('Not in word list');
      shakeTiles(activeTiles);
      return;
   }

   stopInteraction();
   activeTiles.forEach((...params) => flipTile(...params, guess));
}

function deleteKey () {
   const activeTiles = getActiveTiles();
   if (activeTiles.length === 0) return;

   const lastTile = activeTiles[activeTiles.length - 1];
   if (lastTile === null) return;
   
   lastTile.textContent = '';
   delete lastTile.dataset.state;
   delete lastTile.dataset.letter;
}

startInteraction();