var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;


var diagnosticPara = document.querySelector('#reconhecimento');

var testBtn = document.querySelector('button');

function generateNumbers(n) {
  numString = "";
  for (i = 1; i <= n; i++) {
    if (i != n) {
      numString += String(i) + " | ";
    } else {
      numString += String(i);
    }
  }

  return numString;
}

function isValidTimer(strtext) {
  if (strtext.search("timer") >= 0) {
    const numRegex = new RegExp('100|[1-9][0-9]|[0-9]');
    if (numRegex.test(strtext)) {
      const number = numRegex.exec(strtext)[0];
      if (strtext.search("minutos") >= 0) {
        const name = strtext.substring(strtext.search("minutos") + 7);
        return { valid: true, format: 'M', value: number, name };
      } else if (strtext.search("segundos") >= 0) {
        const name = strtext.substring(strtext.search("segundos") + 8);
        return { valid: true, format: 'S', value: number, name };
      }
    }
  }

  return { valid: false, format: null, value: null, name: null };
}

const nameDOM = document.querySelector("#nome");
const minutosDOM = document.querySelector("#minutos");
const segundosDOM = document.querySelector("#segundos");

localStorage.setItem("startTime", Math.floor(Date.now() / 1000))
let timerID = 0;
function startTimer(timer) {
  window.clearInterval(timerID);
  localStorage.setItem("startTime", Math.floor(Date.now() / 1000));

  let segundos = 0;
  if (timer.format == "S") {
    segundos = timer.value;
  } else {
    segundos = timer.value * 60;
  }

  timerWorkflow(segundos)
  timerID = window.setInterval(() => timerWorkflow(segundos), 500)

  nameDOM.innerText = timer.name;
}

function timerWorkflow(time) {
  const now = Math.floor(Date.now() / 1000);
  const startTime = localStorage.getItem("startTime");
  const diff = now - startTime;
  console.log(diff);
  let segundos = time - diff;

  if (segundos <= 0) {
    segundos = 0;

    const audio = new Audio('notification.ogg');
    audio.play();
    window.clearInterval(timerID);

  }

  const m = checkTime(Math.floor(segundos / 60));
  const s = checkTime(Math.floor(segundos % 60));

  minutosDOM.innerText = m;
  segundosDOM.innerText = s;
}

function checkTime(i) {
  if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
  return i;
}

function testSpeech() {
  testBtn.disabled = true;
  testBtn.textContent = 'Test in progress';

  // To ensure case consistency while checking with the returned output text
  diagnosticPara.textContent = '...diagnostic messages';

  let numbersGenerated = generateNumbers(100);
  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = timer <number> (minutos {M} | segundos {S}); public <number> = ' + numbersGenerated;
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

  recognition.start();

  recognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object 
    console.log(event.results);
    var speechResult = event.results[event.results.length - 1][0].transcript.toLowerCase();
    diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
    console.log('Confidence: ' + event.results[0][0].confidence);


    const timer = isValidTimer(speechResult);
    if (timer.valid) {
      startTimer(timer);
    }
  }

  recognition.onspeechend = function () {
    console.log('ended speech');
  }

  recognition.onerror = function (event) {
    diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
  }

  recognition.onaudiostart = function (event) {
    //Fired when the user agent has started to capture audio.
    console.log('SpeechRecognition.onaudiostart');
  }

  recognition.onaudioend = function (event) {
    //Fired when the user agent has finished capturing audio.
    console.log('SpeechRecognition.onaudioend');
  }

  recognition.onend = function (event) {
    //Fired when the speech recognition service has disconnected.
    testSpeech();
    console.log('SpeechRecognition.onend');
  }

  recognition.onnomatch = function (event) {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log('SpeechRecognition.onnomatch');
  }

  recognition.onsoundstart = function (event) {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log('SpeechRecognition.onsoundstart');
  }

  recognition.onsoundend = function (event) {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log('SpeechRecognition.onsoundend');
  }

  recognition.onspeechstart = function (event) {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function (event) {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log('SpeechRecognition.onstart');
  }
}

function iniciarLoop() {
  testSpeech();
}

