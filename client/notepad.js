Template.notepad.rendered = function() {
  var soundSprite = new Audio('//a.clyp.it/h1lz1juv.mp3')
    , noteFrame = undefined
    , notepad = document.getElementById("touch-layer")
    , context = notepad.getContext('2d')
    , clicking = false
    , noteHeight = 13
    , reversedNotes = []

    , drawNotes = function (noteHeight) {
        for (var i = 0; i < noteHeight; i++) {
          noteY = notepad.height / noteHeight;
          context.beginPath();
          context.rect(0, i * noteY, notepad.width, noteY);
          context.fillStyle = '#2b2b2b';
          context.fill();
        }
      }

    , playNote = function(y, height) {

        // trigger audio loop
        if (!noteFrame) {
          noteFrame = reversedNotes[Math.floor(y / height)] * 10;
          soundSprite.currentTime = noteFrame;
          soundSprite.play();
          setInterval(function() {
            soundSprite.currentTime = noteFrame;
            console.log(soundSprite.currentTime);
          }, 4000);
        }

        noteFrame = reversedNotes[Math.floor(y / height)] * 10;
        soundSprite.currentTime = noteFrame;

        context.beginPath();
        context.clearRect(0, y, context.canvas.clientWidth, height);
      }

    , toggleGrid = function(noteHeight) {
        for (var i = 1; i < noteHeight; i++) {
          context.beginPath();
          context.moveTo(0, i * (notepad.height / noteHeight));
          context.lineTo(context.canvas.clientWidth, i * (notepad.height / noteHeight));
          context.stroke();
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
        console.log('mouseup');
        clicking = false;
        noteFrame = 13 * 10
        soundSprite.currentTime = noteFrame;
        drawNotes(noteHeight);
        toggleGrid(noteHeight);
      }

    , touchstart = function (event) {
        event.preventDefault();
        noteY = context.canvas.clientHeight / noteHeight;
        clickedNote = Math.floor((event.targetTouches[0].pageY - $('#touch-layer').offset().top) / noteY);
        playNote(noteY * clickedNote, noteY);
      }

    , touchend = function (event) {
        event.preventDefault();
        noteFrame = 13 * 10;
        soundSprite.currentTime = noteFrame;
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
        noteY = context.canvas.clientHeight / noteHeight;
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

  // initialize
  notepad.width = context.canvas.clientWidth;
  notepad.height = context.canvas.clientHeight;

  for(var i = 0; i < noteHeight; i++) {
    reversedNotes[i] = i;
  }
  reversedNotes = reversedNotes.reverse();
  drawNotes(noteHeight);
  toggleGrid(noteHeight);
  $('#reveal-layer').show();
}
