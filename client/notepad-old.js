// Template.notepad.rendered = function() {
//   var notepad = document.getElementById("notepad")
//     , context = notepad.getContext('2d')
//     , clicking = false
//     , touches = []
//     , notes = []
//
//     , createNote = function (x, y, width, height) {
//         var x = x
//           , y = y
//           , width = width
//           , height = height;
//
//         return note = {
//           getProps: function() {
//             return [x, y, width, height];
//           }
//         };
//       }
//
//     , drawNotes = function (n) {
//         for (var i=0; i < n; i++) {
//           context.beginPath();
//           context.rect(0, n*i, context.canvas.clientWidth, context.canvas.clientHeight / n);
//           context.fillStyle = 'yellow';
//           context.fill();
//
//           notes.push(createNote(0, n*i, context.canvas.clientWidth, context.canvas.clientHeight / n));
//         }
//       }
//
//     , animateNote = setInterval(function() {
//         while (clicking) {
//           console.log('animating')
//         }
//       }, 1000 / 60);
//
//     , mousedown = function (event) {
//         clicking = true;
//         notes.forEach(function(note) {
//           if (note.getProps[])
//         });
//       }
//
//     , mousemove = function (event) {
//         if (clicking) {
//           console.log('clicking');
//         }
//       }
//
//     , mouseup = function (event) {
//         console.log('mouseup');
//         clicking = false;
//       }
//
//     , touchstart = function (event) {
//         event.preventDefault();
//         console.log('touchstart');
//       }
//
//     , touchend = function (event) {
//         event.preventDefault();
//         console.log('touchend');
//       }
//
//     , touchcancel = function (event) {
//         event.preventDefault();
//         console.log('touchcancel');
//       }
//
//     , touchleave = function (event) {
//         event.preventDefault();
//         console.log('touchleave');
//       }
//
//     , touchmove = function (event) {
//         event.preventDefault();
//         console.log('touchmove');
//       };
//
//   notepad.addEventListener("mousedown", mousedown, false);
//   notepad.addEventListener("mousemove", mousemove, false);
//   notepad.addEventListener("mouseup", mouseup, false);
//   notepad.addEventListener("touchstart", touchstart, false);
//   notepad.addEventListener("touchend", touchend, false);
//   notepad.addEventListener("touchcancel", touchcancel, false);
//   notepad.addEventListener("touchleave", touchleave, false);
//   notepad.addEventListener("touchmove", touchmove, false);
//
//   drawNotes(13);
// }
