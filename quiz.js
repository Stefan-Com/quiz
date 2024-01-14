const playBtn = document.querySelector("#play_button");
let question = undefined;
let running = false;
let index = 1;
let score = 0;
let questions = [];

async function displayNextQuestion(){
  return new Promise(resolve => {
      if (document.querySelector(".next_button").style.opacity == "1") resolve();
    document.querySelector(".next_button").onclick = () => resolve();
  });
}
async function delay(){
  return  new Promise(resolve => setTimeout(resolve, ms));
}

async function play(){
  if (running) return;
  running = true;
  try {
    document.querySelector("#play_button").style.pointerEvents = "none";

    if (document.querySelector(".container").contains(document.querySelector(".result"))){
      document.querySelector(".result").remove();
    };

    set_loading("#play_button");
    const load = setInterval(() => {set_loading("#play_button")}, 500);

    document.querySelector(".play_screen").style.display = "inline-block"

    const selected_category = document.querySelector("#category_select").value;
    const difficulty = document.querySelector("#difficulty_select").value;

    const get_questions = () => new Promise(async (resolve) => {
      while (questions.length < 10){
        // Get 10 questions from the API
        const response = await fetch("https://the-trivia-api.com/v2/questions");
        let data = await response.json();
        data = data.filter(e => e.difficulty === difficulty);
        while (questions.some(e => e == data)){
          response = await fetch("https://the-trivia-api.com/v2/questions/");
          data = await response.json();
          data = data.filter(e => e.difficulty === difficulty);
        };
        if (selected_category == "random"){
          questions.push(...data);
        } else {
          questions.push(...data.filter(e => (e.category == selected_category)));
        };
      }
      resolve();
    });

    await get_questions();
    clearInterval(load);

    if (document.querySelector(".get_quiz_error")) 
      document.querySelector(".get_quiz_error").style.display = "none";

    for (let i = 1; i <= 10; i++){
      ask_question();
      index++;
      await displayNextQuestion();
    };
    show_score();
  } catch (error){
    // In case of error make error text visible
    if (document.querySelector(".get_quiz_error")) 
      document.querySelector(".get_quiz_error").style.display = "block";
  };
  running = false;
};

playBtn.onclick = () => play();

document.body.addEventListener("keydown", e => {
  if (e.key == "p")
    play();
});

function ask_question(){
  const container = document.querySelector(".container");

  if (container.contains(document.querySelector(".score_display"))){
    document.querySelector(".score_display").remove();
  };

  const trivia = questions[index - 1];

  const score_display = document.createElement("p");
  score_display.innerHTML = `Score: ${score}/10`;
  score_display.classList.add("score_display");
  container.appendChild(score_display);

  if (container.contains(document.querySelector(".buttons"))){
    document.querySelector(".buttons").remove();
  };
  const div = document.createElement("div");
  div.classList.add("buttons");
  container.appendChild(div);

  container.querySelector(".play_screen").style.display = "none";
  const answers = [];
  const correct_ans = trivia.correctAnswer.trim();
  answers.push(...trivia.incorrectAnswers);
  answers.push(trivia.correctAnswer);
  answers.sort(() => Math.random() - 0.5);
  div.innerHTML = `<div>${index}. ${trivia.question.text}</div>`;
  const next_button = document.createElement("button");
  next_button.classList.add("next_button");
  if (index < 10) {
    next_button.innerText = "Next question";
  } else {
    next_button.innerText = "Submit answers";
  };
  next_button.style.opacity = "0";
  next_button.style.pointerEvents = "none";

  answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.innerHTML = answer.trim();
    btn.addEventListener("click", () => {
      if (answer.trim() == correct_ans){
        score++;
        document.querySelector(".score_display").innerHTML = `Score: ${score}/10`;
        btn.style.background = "rgb(18, 180, 18)";
      } else {
        document.querySelectorAll("answer-btn").forEach(button => {
          console.log(button.innerHTML);
          if (button.innerHTML == correct_ans)
          document.querySelector("#true").style.background = "rgb(18, 180, 18)";
        })
        // if (document.(document.querySelector("#true")))
        btn.style.background = "rgb(255, 73, 73)";
      };
      next_button.style.opacity = "1";
      next_button.style.pointerEvents = "All";
      document.querySelectorAll(".answer_btn").forEach(e => e.style.pointerEvents = "none");
    });
    btn.classList.add("answer_btn");
    div.appendChild(btn);
  });
  div.appendChild(next_button);
};

function show_score(){
  const container = document.querySelector(".container");
  container.querySelector(".score_display").remove()
  const result = document.createElement("div");
  if (container.contains(document.querySelector(".buttons"))){
    container.querySelector(".buttons").remove();
  };
  result.innerHTML += `You scored ${score}/10.`;
  result.appendChild(document.createElement("br"));
  result.innerHTML += "Play again?";
  const btn = document.createElement("button");
  btn.id = "play_button";
  btn.innerHTML = "Go back to the start";
  btn.onclick = () => {
    document.querySelector(".play_screen").style.display = "inline-block";
    document.querySelector("#play_button").innerHTML = "Play";
    document.querySelector(".result").remove();
  };
  result.appendChild(document.createElement("br"));
  result.appendChild(btn);
  result.classList.add("result");
  container.appendChild(result);
  index = 1;
  questions = [];
  document.querySelector("#play_button").style.pointerEvents = "all";
};

function set_loading(button_class){
  let message = document.querySelector(button_class).innerHTML;
  if (!message.slice(-3).includes("...")){
    message += "."
  } else {
    message = message.split("...")[0]
  }
  document.querySelector(button_class).innerHTML = message;
};