// Pure Functions
var flipSetPosition = function (n, first, last) {
      return -n + first + last;
    }

  , getFrequency = function (baseFrequency, semitones) {
      return baseFrequency * Math.pow(Math.pow(2, 1/12), semitones);
    };

Meteor.startup(function() {
  Session.set('secondMenu', '');
  Session.set('volume', 80);
  Session.set('notes', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  Session.set('rootNote', 0);
  Session.set('baseFrequency', 27.5);
  Session.set('noteHeight', 13);
  Session.set('octave',  2);
  Session.set('waveShapes', ['sine', 'triangle', 'sawtooth', 'square']);
  Session.set('waveShape', 2);
  Session.set('delay', 20);
  Session.set('scales', {
    'Chromatic': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  , 'Major': [1, 3, 5, 6, 8, 10, 12, 13]
  , 'Minor': [1, 3, 4, 6, 8, 9, 11, 13]
  , 'Blues': [1, 4, 6, 7, 8, 11, 13]
  , 'Lydian': [1, 3, 5, 7, 8, 10, 12, 13]
  , 'Mixolydian': [1, 3, 5, 6, 8, 10, 11, 13]
  , 'Octatonic A': [1, 3, 4, 6, 7, 9, 10, 12, 13]
  , 'Octatonic B': [1, 2, 4, 5, 7, 8, 10, 11, 13]
  , 'Whole Tone': [1, 3, 5, 7, 9, 11, 13]
  });
  Session.set('scale', Session.get('scales')['Chromatic']);



  //ED'S STUFF
  Session.set('tempo', 1000);
  Session.set('key', "C");  //switch this to rootNote eventually?
  Session.set('chordProgression',["I", "I", "I", "I","IV", "IV", "I", "I", "V", "IV", "I", "I"]);
  Session.set('mode', "Major"); //work this into scales



});

Template.notepad.helpers({
  active: function () {
    return Session.get('secondMenu');
  }

, volume: function () {
    return Session.get('volume');
  }

, octave: function () {
    return Session.get('octave');
  }

, rootNote: function () {
    if (Session.get('notes')) {
      return Session.get('notes')[Session.get('rootNote')];
    }
  }

, rootNoteValue: function () {
    return Session.get('rootNote');
 }

, waveShape: function () {
    if (Session.get('waveShapes')) {
      return Session.get('waveShapes')[Session.get('waveShape')];
    }
  }

, waveShapeValue: function () {
    return Session.get('waveShape');
  }

, delay: function () {
    return Session.get('delay');
  }

, scales: function () {
    var scales = [];
    for (key in Session.get('scales')) {
      scales.push(key);
    }
    return scales;
  }

, tempo: function() {
    return Session.get('tempo');
  }

, bpm: function() {
    return flipSetPosition(Math.floor(Session.get('tempo') / 10), 60, 200);
  }

, bars: function() {
    return Session.get('chordProgression');
  }
});

Template.notepad.events({

  // Sliders
  'mousedown input, mousemove input': function (event) {
    Session.set(event.target.id, +event.target.value);
  }

, 'change .scale': function (event) {
    var scale = Session.get('scales')[event.target.value];
    Session.set('scale', scale);
    Session.set('noteHeight', scale.length);
  }

, 'change .switch input': function (event) {
    Session.set('secondMenu', Session.get('secondMenu') === '' ? 'active' : '');
    if (Session.get('secondMenu') === 'active') {
      $('.second-menu').css('opacity', 1)
    }

    else {
      setTimeout(function() {
        $('.second-menu').css('opacity', 0);
      }, 700);
    }
  }
});

Template.notepad.rendered = function() {

var audioContext = new (window.AudioContext || window.webkitAudioContext)()


  // iOS requires user input to trigger audio
  , audioPlaying = false
  , clicking = false

  // oscillator
  , oscillator = audioContext.createOscillator()
  , delay = audioContext.createDelay()
  , feedback = audioContext.createGain()
  , gain = audioContext.createGain()


  , intervalId
  , playing = false


  // ED'S VARIABLES
  , notesArray = ['Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G']
  , soundsCurrentlyPlaying = []
  , chordsToPlay = []
  , noteSamples = {}

  // canvas
  , notepad = document.getElementById('touch-layer')
  , canvasContext = notepad.getContext('2d')

  , drawNotes = function (noteHeight) {
      for (var i = 0; i < noteHeight; i++) {
        noteY = notepad.height / noteHeight;
        canvasContext.beginPath();
        canvasContext.rect(0, i * noteY, notepad.width, noteY);
        canvasContext.fillStyle = '#2b2b2b';
        canvasContext.fill();
      }
    }

  , playNote = function (y, height) {
      // audio
      oscillator.frequency.value =
        getFrequency(
          Session.get('baseFrequency') * Math.pow(2, Session.get('octave'))
        , Session.get('scale')[
            flipSetPosition(Math.floor(y / height), 0, 12)
          - flipSetPosition(Session.get('noteHeight'), 0, 12) - 1
          ] + Session.get('rootNote')
        );

      feedback.gain.value = Session.get('volume') / 100;
      gain.gain.value = Session.get('volume') / 100;

      // temporarily remove top layer
      canvasContext.beginPath();
      canvasContext.clearRect(0, y, canvasContext.canvas.clientWidth, height);
    }

  , fadeGain = function (gain, speed) {
      var fader = setInterval(function() {
        if (gain.gain.value > 0) {
          gain.gain.value -= 0.01;
        }
        else {
          gain.gain.value = 0;
          clearInterval(fader);
        }
      }, speed);
    }

  , fadeFeedback = function (feedback, speed) {
      var fader = setInterval(function() {
        if (feedback.gain.value > 0) {
          feedback.gain.value -= 0.01;
        }
        else {
          feedback.gain.value = 0;
          clearInterval(fader);
        }
      }, speed);
    }

  , toggleGrid = function (noteHeight) {
      for (var i = 1; i < noteHeight; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, i * (notepad.height / noteHeight));
        canvasContext.lineTo(
          canvasContext.canvas.clientWidth, i * (notepad.height / noteHeight)
        );
        canvasContext.stroke();
      }
    }

  , mousedown = function (event) {
      noteY = notepad.height / Session.get('noteHeight');
      clickedNote = Math.floor(event.offsetY / noteY);
      playNote(noteY * clickedNote, noteY);
      clicking = true;
      if (!audioPlaying) {
        oscillator.start();
        audioPlaying = true;
      }
    }

  , mousemove = function (event) {
      if (clicking) {
        noteY = notepad.height / Session.get('noteHeight');
        clickedNote = Math.floor(event.offsetY / noteY);
        playNote(noteY * clickedNote, noteY);
      }
    }

  , mouseup = function (event) {
      clicking = false;
      fadeGain(gain, Session.get('delay') / 10);
      drawNotes(Session.get('noteHeight'));
      toggleGrid(Session.get('noteHeight'));
    }

  , touchstart = function (event) {
      event.preventDefault();
      noteY = canvasContext.canvas.clientHeight / Session.get('noteHeight');
      clickedNote =
        Math.floor(
          (event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY
        );
      playNote(noteY * clickedNote, noteY);
      if (!audioPlaying) {
        oscillator.start();
        audioPlaying = true;
      }
    }

  , touchend = function (event) {
      event.preventDefault();
      fadeGain(gain, Session.get('delay') / 10);
      drawNotes(Session.get('noteHeight'));
      toggleGrid(Session.get('noteHeight'));
    }

  , touchcancel = function (event) {
      event.preventDefault();
    }

  , touchleave = function (event) {
      event.preventDefault();
    }

  , touchmove = function (event) {
      event.preventDefault();
      noteY = canvasContext.canvas.clientHeight / Session.get('noteHeight');
      clickedNote =
        Math.floor(
          (event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY
        );
      playNote(noteY * clickedNote, noteY);
    };



/*
//  ED'S STUFF
//
//
//
//
//
*/


  function generateMode(key, mode) {

    var notesArray = [
      "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
      "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
      "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
      "C"]

      , modesArrays = {
        "Major" : [0, 2, 4, 5, 7, 9, 11],
        "Minor" : [0, 2, 3, 5, 7, 8, 10],
        "Blues" : [0, 3, 5, 6, 7, 9, 10],
        "Ionian" : [0, 2, 4, 5, 7, 9, 11],
        "Dorian" : [2, 4, 5, 7, 9, 11, 12],
        "Phrygian" : [4, 5, 7, 9, 11, 12, 14],
        "Lydian" : [5, 7, 9, 11, 12, 14, 16],
        "Mixolydian" : [7, 9, 11, 12, 14, 16, 17],
        "Aeolian" : [9, 11, 12, 14, 16, 17, 19],
        "Locrian" : [11, 12, 14, 16, 17, 19, 21],
      }
      , keyNumber = notesArray.indexOf(key)
      , result = [];
      ;
      for (var x in modesArrays[mode]) {
        result.push(notesArray[modesArrays[mode][x] + keyNumber]);
      }
      return result;
  }

function generateChord(chord, key, mode) {
  var notesArray = [
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
    "C"]
    , chordsArrays = {
      "maj": [0, 4, 7],
      "min": [0, 3, 7],
      "7": [0, 4, 7, 10],
      "maj7":  [0, 4, 7, 11],
      "min7": [0, 3, 7, 10],
      "dim": [0, 3, 6],
      "o": [0, 3, 6],
      "aug": [0, 4, 8],
      "+": [0, 4, 8],
      "sus4": [0, 5, 7],
      "add2": [0, 2, 4, 7]
    }
    , numericChordsArray = [
      "I", "II", "III", "IV", "V", "VI", "VII", "i", "ii", "iii", "iv", "v", "vi", "vii"
    ]
    , keyNumber = notesArray.indexOf(key)
    , numericChordNumber
    , mode = generateMode(key, mode)
    , chordType = ""  //maj7, aug, etc
    , result = []
    ;

    //scan through the chord string until additional note characters (ie: 7, aug, min7) are either found or not
    for (var x = 0; x < chord.length; x++) {
      if (!(/[IiVv]/.test(chord[x]))) {
        chordType = chord.slice(x);
        chord = chord.slice(0, x);
        break;
      }
    }
    //do some string-matching to figure out which roman numeral the chord is
    //get the index of that numeral in numericChordsArray
    for (var x in numericChordsArray) {
      if (chord.indexOf(numericChordsArray[x]) >= 0) {
        if (chord.length == numericChordsArray[x].length) {
          numericChordNumber = x;
        }
      }
    }
    //if the chord wasn't weird, assign it either major or minor
    if (chordType == "") {
      chordType = (numericChordNumber < 7) ? "maj" : "min";
    }
    //if it's a minor chord, fix up a problem with assigning the min7 chord, if applicable
    //then, prep numericChordNumber for the big push
    if (numericChordNumber >= 7) {
      if (chordType == "7") {
        chordType = "min7";
      }
      numericChordNumber -= 7;
    }
    //add every note in the generated chord to result
    //factor in the mode to get the correct notes (otherwise every chord will be a root chord)
    //(the mode already factored in the key when it was generated)
    for (var x in chordsArrays[chordType]) {
      result.push(notesArray[chordsArrays[chordType][x] + notesArray.indexOf(mode[numericChordNumber])]);
    }
    return result;
  }





    function BufferLoader(context, urlList, callback) {
      this.context = context;
      this.urlList = urlList;
      this.onload = callback;
      this.bufferList = new Array();
      this.loadCount = 0;
    }

    //BufferLoader
    //from HTML5Rocks.com

    BufferLoader.prototype.loadBuffer = function(url, index) {
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      var loader = this;

      request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
          request.response,
          function(buffer) {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount == loader.urlList.length)
              loader.onload(loader.bufferList);
          },
          function(error) {
            console.error('decodeAudioData error', error);
          }
        );
      }

      request.onerror = function() {
        alert('BufferLoader: XHR error');
      }

      request.send();
    }

    BufferLoader.prototype.load = function() {
      for (var i = 0; i < this.urlList.length; ++i)
      this.loadBuffer(this.urlList[i], i);
  }

function bufferCallback(bufferList){
  for (var x = 0, len = bufferList.length; x < len; x++) {
    noteSamples[notesArray[x]] = bufferList[x];
  }
  $("#playChordProgressionButton")
    .html('<i class="mdi-av-play-arrow"></i>').removeAttr("disabled");
  $("#stopChordProgressionButton").removeAttr("disabled");
}

function playSound(buffer, when, offset, duration) {
  var source = audioContext.createBufferSource();
  source.buffer = buffer;
  //source.loop = true;
  source.connect(audioContext.destination);
  source.start(when, offset, duration);
  return source;
}

function playChordProgression() {
  var chordProgression = Session.get('chordProgression');
  var tempo = Session.get("tempo");
  chordsToPlay = [];
  stopChordProgression();
  for (var x = 0, len = chordProgression.length; x < len; x++) {
    chordsToPlay.push(generateChord(chordProgression[x], Session.get('key'), Session.get('mode')));
  }
  var currentBar = 0;
  $('.led-blue').removeClass('active');
  $($('.led-blue')[currentBar++]).addClass('active');

  if (!playing) {
    intervalId = setInterval(function() {
      currentBar =
        currentBar === chordProgression.length
        ? 0
        : currentBar;
      if (currentBar === 0) {
        playChordProgression();
      }
      $('.led-blue').removeClass('active');
      $($('.led-blue')[currentBar++]).addClass('active');
    }, tempo);
  }

  playing = true;
  //for (var loopCount = 1; loopCount < 50; loopCount++) {
  for (var bar = 0; bar < chordsToPlay.length; bar++){
    for (var x = 0, len = chordsToPlay[bar].length; x < len; x++) {
      var time = audioContext.currentTime;
      soundsCurrentlyPlaying.push(
        playSound(
          noteSamples[chordsToPlay[bar][x]]
        , time + (tempo / 1000) * bar
        , 0
        , tempo / 1000
        )
      );
    }
  }
}

function stopChordProgression() {
  clearInterval(intervalId);
  $('.led-blue').removeClass('active');
  playing = false;
  for (var x in soundsCurrentlyPlaying) {
    soundsCurrentlyPlaying[x].stop();
  }
  soundsCurrentlyPlaying = [];
  chordsToPlay = [];
  //nextChordProgression = {};
}

/*
//
//  END OF ED'S STUFF
//
*/

  // hookup event handlers
  notepad.addEventListener('mousedown', mousedown, false);
  notepad.addEventListener('mousemove', mousemove, false);
  notepad.addEventListener('mouseup', mouseup, false);
  notepad.addEventListener('touchstart', touchstart, false);
  notepad.addEventListener('touchend', touchend, false);
  notepad.addEventListener('touchcancel', touchcancel, false);
  notepad.addEventListener('touchleave', touchleave, false);
  notepad.addEventListener('touchmove', touchmove, false);

  // initialize canvas
  notepad.width = canvasContext.canvas.clientWidth;
  notepad.height = canvasContext.canvas.clientHeight;

  drawNotes(Session.get('noteHeight'));
  toggleGrid(Session.get('noteHeight'));
  $('#reveal-layer').show();

  // initialize material design
  $('select').material_select();
  $('.modal-trigger').leanModal();

  // initialize audio
  oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];
  oscillator.frequency.value = Session.get('baseFrequency'); // value in hertz
  delay.delayTime.value = Session.get('delay') / 1000;
  feedback.gain.value = Session.get('volume') / 100;
  gain.gain.value = Session.get('volume') / 100;

  // oscillator.connect(delay);
  // delay.connect(feedback);
  // feedback.connect(delay);
  // delay.connect(gain);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  // exposed events
  $('.wave-shape input').change(function() {
    setTimeout(function() {
      oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];
    }, 0);
  });

  $('.delay input').change(function() {
    setTimeout(function() {
      delay.delayTime.value = Session.get('delay') / 1000
    }, 0);
  });

  $('select').change(function() {
    setTimeout(function() {
      drawNotes(Session.get('noteHeight'));
      toggleGrid(Session.get('noteHeight'));
    }, 0);
  });

  //ED'S STUFF INITIALIZATION
  var bufferLoader;
  var soundFilesArray = [];
  for (var x = 0, len = notesArray.length; x < len; x++) {
    soundFilesArray.push("SFX/" + notesArray[x] + ".mp3");
  }
  bufferLoader = new BufferLoader(audioContext, soundFilesArray, bufferCallback);
  bufferLoader.load();

  document.addEventListener('touchstart', function(event) {
    if (event.target.id === 'playChordProgressionButton') {
      if (! soundsCurrentlyPlaying.length > 0) {
        playChordProgression();
        //$("#playChordProgressionButton").attr("disabled", true);
      }
    }
  });

  document.addEventListener('touchstart', function(event) {
    if (event.target.id === 'stopChordProgressionButton') {
      stopChordProgression();
    }
  });

  $("#playChordProgressionButton").click(function(){
    if (!playing) {
      $(this).html('<i class="mdi-av-stop"></i>');
      if (! soundsCurrentlyPlaying.length > 0) {
        playChordProgression();
      }
    }

    else {
      $(this).html('<i class="mdi-av-play-arrow"></i>');
      stopChordProgression();
    }

  });
}
