const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");
const scoreText = document.getElementById("score");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;

let questions = [];

fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
    .then(res => {
        return res.json();
    })
    .then(loadedQuestions => {
        questions = loadedQuestions.results.map(loadedQuestion => {
            const formattedQuestion = {
                question: loadedQuestion.question,
                answer : Math.floor(Math.random() * 3) + 1
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];

            answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);
            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice" + String(index + 1)] = choice;
            });

            return formattedQuestion;
        });

        startGame();
    });

// CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [... questions];
    getNextQuestions();
}

getNextQuestions = () => {
    if (availableQuestions.length == 0 || questionCounter > MAX_QUESTIONS) {
        localStorage.setItem("mostRecentScore", score);
        return window.location.assign("/end.html");
    }

    questionCounter++;
    questionCounterText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);

    // Randomly choose question
    currentQuestion = availableQuestions[questionIndex];

    // Populate Question element
    question.innerText = currentQuestion.question;
    
    // Populate choice elements
    choices.forEach(choice => {
        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number];
    });

    // Remove current question from available questions pool
    availableQuestions.splice(questionIndex, 1);
    
    acceptingAnswers = true;

    choices.forEach(choice => {
        choice.addEventListener("click", e => {
            if (acceptingAnswers == false) return;

            acceptingAnswers = false;

            const selectedChoice = e.target;
            const selectedAnswer = selectedChoice.dataset["number"];
            
            const classToApply = selectedAnswer == currentQuestion.answer 
                               ? "correct" : "incorrect";
            
            if (classToApply == "correct") {
                incrementScore(CORRECT_BONUS);
            }

            selectedChoice.parentElement.classList.add(classToApply);
            setTimeout(() => {
                selectedChoice.parentElement.classList.remove(classToApply);
                getNextQuestions();
            }, 1000)
            
        });
    })
}

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
}