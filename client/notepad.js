// Pure Functions
var flipSetPosition = function (n, first, last) {
      return -n + first + last;
    }

  , getFrequency = function (baseFrequency, semitones) {
      return baseFrequency * Math.pow(Math.pow(2, 1/12), semitones);
    };

Meteor.startup(function() {
  Session.set('volume', 80);
  Session.set('notes', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  Session.set('rootNote', 0);
  Session.set('baseFrequency', 27.5);
  Session.set('noteHeight', 13);
  Session.set('octave',  2);
  Session.set('waveShapes', ['sine', 'triangle', 'sawtooth', 'square']);
  Session.set('waveShape', 2);
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
});

Template.notepad.helpers({
  volume: function () {
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
});

Template.notepad.rendered = function() {

var audioContext = new (window.AudioContext || window.webkitAudioContext)()

  // iOS requires user input to trigger audio
  , audioPlaying = false
  , clicking = false

  // oscillator
  , oscillator = audioContext.createOscillator()
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

      gain.gain.value = Session.get('volume') / 100;

      console.log(gain.gain.value);

      // temporarily remove top layer
      canvasContext.beginPath();
      canvasContext.clearRect(0, y, canvasContext.canvas.clientWidth, height);
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
      gain.gain.value = 0;
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
      gain.gain.value = 0;
      drawNotes(Session.get('noteHeight'));
      toggleGrid(Session.get('noteHeight'));
    }

  , touchcancel = function (event) {
      event.preventDefault();
      console.log('touchcancel');
    }

  , touchleave = function (event) {
      event.preventDefault();
      console.log('touchleave');
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
  gain.gain.value = Session.get('volume') / 100;
  oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];
  oscillator.frequency.value = Session.get('baseFrequency'); // value in hertz

  gain.connect(audioContext.destination);
  oscillator.connect(gain);

  // exposed events
  $('.wave-shape input').change(function() {
    setTimeout(function() {
      oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];
    }, 0);
  });

  $('select').change(function() {
    setTimeout(function() {
      drawNotes(Session.get('noteHeight'));
      toggleGrid(Session.get('noteHeight'));
    }, 0);
  });

}
