Meteor.startup(function () {
  Session.set('secondMenu', '');
  Session.set('baseFrequency', 27.5);
  Session.set('volume', 80);
  Session.set('notes', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  Session.set('rootNote', 0);
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
  Session.set('tempo', 1000);
  Session.set('chordProgression'
  , ['I', 'I', 'I', 'I','IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I']
  );
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
  Session.set('mode', 'Major');
});
