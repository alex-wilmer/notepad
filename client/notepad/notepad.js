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
  Session.set('degrees', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']);
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

      console.log(oscillator.frequency.value);

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
    }

  , generateChord = function (chord, key, mode) {
      var keyNumber = notesArray.indexOf(key.note)
    		, numericChordNumber
    		, mode = generateMode(key, mode)
    		, chordType = ""	//maj7, aug, etc
    		, result = [];

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
  		if (chordType === '') {
  			chordType = (numericChordNumber < 7) ? 'maj' : 'min';
  		}

  		//if it's a minor chord, fix up a problem with assigning the min7 chord, if applicable
  		//then, prep numericChordNumber for the big push
  		if (numericChordNumber >= 7) {
  			if (chordType == '7') {
  				chordType = 'min7';
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
    };

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
}
