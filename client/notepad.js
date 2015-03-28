// Pure Functions
var flipSetPosition = function (n, first, last) {
      return -n + first + last;
    }

  , getFrequency = function (baseFrequency, semitones) {
      return baseFrequency * Math.pow(Math.pow(2, 1/12), semitones);
    }

  , mod = function (n, length) {
      if (n > length) {
        return 0;
      }
      if (n < 0) {
        return length;
      }
      return n;
    };

Meteor.startup(function() {
  Session.set('notes', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  Session.set('rootnote', 0);
  Session.set('baseFrequency', 27.5);
  Session.set('noteHeight', 13);
  Session.set('octave',  1);
  Session.set('waveShapes', ['sine', 'triangle', 'sawtooth', 'square']);
  Session.set('waveShape', 2);
});

Template.notepad.helpers({
  octave: function () {
    return Session.get('octave');
  }

, rootnote: function () {
    if (Session.get('notes')) {
      return Session.get('notes')[Session.get('rootnote')];
    }
  }

, waveshape: function () {
    if (Session.get('waveShapes')) {
      return Session.get('waveShapes')[Session.get('waveShape')];
    }
  }
});

Template.notepad.events({
  'click .octave i': function (event) {
    Session.set('octave',
      event.target.className.indexOf('left') > -1
        ? Session.get('octave') - 1
        : Session.get('octave') + 1
    );
  }

, 'click .rootnote i': function (event) {
    Session.set('rootnote',
      (function() {
        var current = Session.get('rootnote');
        current = event.target.className.indexOf('left') > -1
          ? current - 1
          : current + 1;
          return mod(current, 11);
      }())
    );
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
        , flipSetPosition(Math.floor(y / height), 0, 12) + Session.get('rootnote')
        );

      console.log(oscillator.frequency.value);
      gain.gain.value = 1;

      // temporarily remove top layer
      canvasContext.beginPath();
      canvasContext.clearRect(0, y, canvasContext.canvas.clientWidth, height);
    }

  , toggleGrid = function (noteHeight) {
      for (var i = 1; i < noteHeight; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, i * (notepad.height / noteHeight));
        canvasContext.lineTo(canvasContext.canvas.clientWidth, i * (notepad.height / noteHeight));
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
      clickedNote = Math.floor((event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY);
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

  // initialize audio
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];

  oscillator.frequency.value = Session.get('baseFrequency'); // value in hertz
}
