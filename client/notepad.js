Template.notepad.rendered = function() {
  var audioContext = new (window.AudioContext || window.webkitAudioContext)()
    , oscillator = audioContext.createOscillator()
    , frequency = 1000
    , waveShape = 'sine'
    , gain = audioContext.createGain()
    , notepad = document.getElementById("touch-layer")
    , canvasContext = notepad.getContext('2d')
    , clicking = false
    , noteHeight = 13

    , drawNotes = function (noteHeight) {
        for (var i = 0; i < noteHeight; i++) {
          noteY = notepad.height / noteHeight;
          canvasContext.beginPath();
          canvasContext.rect(0, i * noteY, notepad.width, noteY);
          canvasContext.fillStyle = '#2b2b2b';
          canvasContext.fill();
        }
      }

    , playNote = function(y, height) {

        oscillator.frequency.value = (Math.floor(y / height) * 100) + 200;
        console.log(oscillator.frequency.value);
        gain.gain.value = 1;
        canvasContext.beginPath();
        canvasContext.clearRect(0, y, canvasContext.canvas.clientWidth, height);
      }

    , toggleGrid = function(noteHeight) {
        for (var i = 1; i < noteHeight; i++) {
          canvasContext.beginPath();
          canvasContext.moveTo(0, i * (notepad.height / noteHeight));
          canvasContext.lineTo(canvasContext.canvas.clientWidth, i * (notepad.height / noteHeight));
          canvasContext.stroke();
        }
      }

    , mousedown = function (event) {
        noteY = notepad.height / noteHeight;
        clickedNote = Math.floor(event.offsetY / noteY);
        playNote(noteY * clickedNote, noteY);
        clicking = true;
      }

    , mousemove = function (event) {
        if (clicking) {
          noteY = notepad.height / noteHeight;
          clickedNote = Math.floor(event.offsetY / noteY);
          playNote(noteY * clickedNote, noteY);
        }
      }

    , mouseup = function (event) {
        clicking = false;
        gain.gain.value = 0;
        drawNotes(noteHeight);
        toggleGrid(noteHeight);
      }

    , touchstart = function (event) {
        event.preventDefault();
        noteY = canvasContext.canvas.clientHeight / noteHeight;
        clickedNote = Math.floor((event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY);
        playNote(noteY * clickedNote, noteY);
      }

    , touchend = function (event) {
        event.preventDefault();
        gain.gain.value = 0;
        drawNotes(noteHeight);
        toggleGrid(noteHeight);
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
        noteY = canvasContext.canvas.clientHeight / noteHeight;
        clickedNote = Math.floor((event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY);
        playNote(noteY * clickedNote, noteY);
      };

  notepad.addEventListener("mousedown", mousedown, false);
  notepad.addEventListener("mousemove", mousemove, false);
  notepad.addEventListener("mouseup", mouseup, false);
  notepad.addEventListener("touchstart", touchstart, false);
  notepad.addEventListener("touchend", touchend, false);
  notepad.addEventListener("touchcancel", touchcancel, false);
  notepad.addEventListener("touchleave", touchleave, false);
  notepad.addEventListener("touchmove", touchmove, false);

  // initialize canvas
  notepad.width = canvasContext.canvas.clientWidth;
  notepad.height = canvasContext.canvas.clientHeight;

  drawNotes(noteHeight);
  toggleGrid(noteHeight);
  $('#reveal-layer').show();

  // initialize audio
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.type = waveShape;
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.start();
}
