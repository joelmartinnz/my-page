let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function checkGuess() {
  const guess = parseInt(document.getElementById('guess').value);
  attempts++;

  if (isNaN(guess) || guess < 1 || guess > 100) {
    document.getElementById('result').textContent = 'Please enter a number between 1 and 100.';
    return;
  }

  if (guess === randomNumber) {
    document.getElementById('result').textContent = `Congratulations! You guessed it in ${attempts} attempts.`;
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
  } else if (guess < randomNumber) {
    document.getElementById('result').textContent = 'Too low! Try again.';
  } else {
    document.getElementById('result').textContent = 'Too high! Try again.';
  }
}
