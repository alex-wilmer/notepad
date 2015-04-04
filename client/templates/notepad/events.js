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

, 'change .chordProgression': function (event) {
    var chord = Session.get('chordProgressions')[event.target.value];
    Session.set('chordProgression', chord);
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
