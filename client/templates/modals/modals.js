Template.modals.helpers({
  'settings': function () {
    return Settings.find({userId: Meteor.userId()});
  }
});

Template.modals.events({
  'submit .save-settings': function (event) {
    event.preventDefault();

    Session.set('currentSetting', event.target.settingName.value);

    var settings = {
      name: event.target.settingName.value
    , userId: Meteor.userId()
    , baseFrequency: Session.get('baseFrequency')
    , volume: Session.get('volume')
    , rootNote: Session.get('rootNote')
    , noteHeight: Session.get('noteHeight')
    , octave: Session.get('octave')
    , waveShape: Session.get('waveShape')
    , decay: Session.get('decay')
    , scale: Session.get('scale')
    , tempo: Session.get('tempo')
    , chordProgression: Session.get('chordProgression')
    , mode: Session.get('mode')
    , song: Session.get('song')
    };

    Settings.insert(settings, function() {
      event.target.settingName.value = '';
      $('.modal').closeModal();
    });
  }

, 'submit .load-setting': function (event) {
    event.preventDefault();

    var setting = Settings.findOne({
      userId: Meteor.userId()
    , name: $('.load-setting :checked').attr('id')
    });

    Session.set('currentSetting', setting.name);
    Session.set('baseFrequency', setting.baseFrequency);
    Session.set('volume', setting.volume);
    Session.set('rooteNote', setting.rootNote);
    Session.set('noteHeight', setting.noteHeight);
    Session.set('octave', setting.octave);
    Session.set('waveShape', setting.waveShape);
    Session.set('decay', setting.decay);
    Session.set('scale', setting.scale);
    Session.set('tempo', setting.tempo);
    Session.set('chordProgression', setting.chordProgression);
    Session.set('mode', setting.mode);

    $('.modal').closeModal();
  }
});
