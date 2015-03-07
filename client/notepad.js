var mouseDown = false;

Template.notepad.created = function() {
  Session.set('notes', [
    'Ab', 'G', 'F#', 'F', 'E', 'Eb'
  , 'D', 'C#', 'C', 'B', 'Bb', 'A'
  ]);
};

Template.notepad.helpers({
  notes: function() {
    return Session.get('notes');
  }
});

Template.notepad.events({
  'mousedown .notepad': function () {
    mouseDown = true;
  }
, 'mouseup .notepad': function () {
    mouseDown = false;
  }
, 'mousedown .note': function(event) {
    event.target.className += ' active';
  }
, 'mouseover .note': function (event) {
    if (mouseDown) {
      event.target.className += ' active';
    }
  }
, 'mouseup .note, mouseout .note': function (event) {
    event.target.className = 'note';
  }
});
