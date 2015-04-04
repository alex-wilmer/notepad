Template.notepad.rendered = function() {
  Session.set('secondMenu', '');
  Session.set('baseFrequency', 27.5);
  Session.set('volume', 80);
  Session.set('notes'
  , ['A', 'B♭', 'B', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭']
  );
  Session.set('rootNote', 0);
  Session.set('noteHeight', 13);
  Session.set('octave',  2);
  Session.set('waveShapes', ['sine', 'triangle', 'sawtooth', 'square']);
  Session.set('waveShape', 2);
  Session.set('decay', 20);
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
  Session.set('tempo', 1000);

  Session.set('key', 'A');
  Session.set('chordProgressions', {
    '12-Bar Blues': ['I', 'I', 'I', 'I','IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V7']
  , '50s': ['I', 'vi', 'IV', 'V']
  , 'Circle': ['I', 'IV', 'viio', 'iii', 'vi', 'ii', 'V', 'I']
  , 'Pop-Punk': ['I', 'V', 'vi', 'IV']
  , 'Jazzy': ['imin7', 'Vmaj7', 'iio', 'V7']
  , 'Airy': ['Imaj7', 'IVmaj7']
  });
  Session.set('chordProgression', Session.get('chordProgressions')['12-Bar Blues']);
  Session.set('mode', 'Ionian');

  var audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // iOS requires user input to trigger audio
    , audioPlaying = false
    , clicking = false

    // oscillator
    , oscillator = audioContext.createOscillator()
    , gain = audioContext.createGain()

    // loop
    , intervalId
    , playing = false

    // ed's
    , soundsCurrentlyPlaying = []
    , chordsToPlay = []
    , noteSamples = {}

    // Canvas
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

    // Oscillator
    , playNote = function (y, height) {
        // audio
        oscillator.frequency.value =
          getFrequency(
            Session.get('baseFrequency') * Math.pow(2, Session.get('octave'))
          , Session.get('scale')[
              flipSetPosition(Math.floor(y / height), 0, 12)
            - flipSetPosition(Session.get('noteHeight'), 0, 12) - 1
          ] + Session.get('rootNote') - 1
          );

        gain.gain.value = Session.get('volume') / 100;

        console.log(oscillator.frequency.value);

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

    // Event Handlers
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
        fadeGain(gain, Session.get('decay') / 10);
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
        fadeGain(gain, Session.get('decay') / 10);
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

    // Chords
    , generateMode = function (key, mode) {
        var notes = Session.get('notes').concat(Session.get('notes'))
          , result = []
          , modes = {
              'Ionian': [0, 2, 4, 5, 7, 9, 11]
            };

        for (var i = 0; i < modes[mode].length; i += 1) {
          result.push(notes[modes[mode][i] + notes.indexOf(key)]);
        }

        return result;
      }

    , generateChord = function (chord, key, mode) {

        var notes = Session.get('notes').concat(Session.get('notes'))
          , chords = {
              'maj': [0, 4, 7]
            , 'min': [0, 3, 7]
            , '7': [0, 4, 7, 10]
            , 'maj7': [0, 4, 7, 11]
            , 'min7': [0, 3, 7, 10]
            , 'dim': [0, 3, 6]
            , 'o': [0, 3, 6]
            , 'aug': [0, 4, 8]
            , '+': [0, 4, 8]
            , 'sus4': [0, 5, 7]
            , 'add2': [0, 2, 4, 7]
            }
          , numericChords = [
              'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'
            , 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'
            ]
          , numericChordNumber
          , mode = generateMode(key, mode)
          , chordType = ''  //maj7, aug, etc
          , result = [];

        //scan through the chord string until additional note characters (ie: 7, aug, min7) are either found or not
        for (var i = 0; i < chord.length; i++) {
          if (! (/[IiVv]/.test(chord[i]))) {
            chordType = chord.slice(i);
            chord = chord.slice(0, i);
            break;
          }
        }
        //do some string-matching to figure out which roman numeral the chord is
        //get the index of that numeral in numericChordsArray
        numericChords.forEach(function (numericChord, index) {
          if (chord.indexOf(numericChord) >= 0) {
            if (chord.length === numericChord.length) {
              numericChordNumber = index;
            }
          }
        });
        //if the chord wasn't weird, assign it either major or minor
        if (!chordType) {
          chordType = (numericChordNumber < 7) ? 'maj' : 'min';
        }
        //if it's a minor chord, fix up a problem with assigning the min7 chord, if applicable
        //then, prep numericChordNumber for the big push
        if (numericChordNumber >= 7) {
          chordType = chordType === '7' ? 'min7': chordType;
          numericChordNumber -= 7;
        }
        //add every note in the generated chord to result
        //factor in the mode to get the correct notes (otherwise every chord will be a root chord)
        //(the mode already factored in the key when it was generated)
        for (var i = 0; i < chords[chordType].length; i += 1) {
          result.push(
            notes[chords[chordType][i] + notes.indexOf(mode[numericChordNumber])]
          );
        }
        return result;
      }

    , bufferCallback = function (bufferList) {
        for (var x = 0, len = bufferList.length; x < len; x++) {
          noteSamples[Session.get('notes')[x]] = bufferList[x];
        }
        $('#playChordProgressionButton')
          .html('<i class="mdi-av-play-arrow"></i>').removeAttr('disabled');
        $('#stopChordProgressionButton').removeAttr('disabled');
      }

    , soundFiles = (function() {
        var result = [];
        for (var i = 0; i < 12; i += 1) {
          result.push('SFX/note' + i + '.mp3');
        }
        return result;
      }())

    , BufferLoader = function (context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
      }

    , bufferLoader =
        new BufferLoader(audioContext, soundFiles, bufferCallback);

  BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

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

  function playSound(buffer, when, offset, duration) {
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(when, offset, duration);
    return source;
  }

  function playChordProgression() {
    var chordProgression = Session.get('chordProgression');
    var tempo = Session.get('tempo');
    chordsToPlay = [];
    stopChordProgression();
    for (var x = 0, len = chordProgression.length; x < len; x++) {
      chordsToPlay.push(generateChord(chordProgression[x], Session.get('notes')[Session.get('rootNote')], Session.get('mode')));  }
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
  }

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
  setTimeout(function() {
    $('select').material_select();
    $('.modal-trigger').leanModal();
  }, 0);

  // initialize audio
  oscillator.type = Session.get('waveShapes')[Session.get('waveShape')];
  oscillator.frequency.value = Session.get('baseFrequency'); // value in hertz
  gain.gain.value = Session.get('volume') / 100;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

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


  // Load chord audio files
  bufferLoader.load();

  document.addEventListener('touchstart', function(event) {
    if (event.target.id === 'playChordProgressionButton') {
      if (! soundsCurrentlyPlaying.length > 0) {
        playChordProgression();
      }
    }
  });

  document.addEventListener('touchstart', function(event) {
    if (event.target.id === 'stopChordProgressionButton') {
      stopChordProgression();
    }
  });

  $('#playChordProgressionButton').click(function(){
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
