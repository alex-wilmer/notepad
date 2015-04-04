Template.notepad.helpers
  active: () ->
    Session.get('secondMenu')

  volume: () ->
    Session.get('volume')

  octave: () ->
    Session.get('octave')

  rootNote: () ->
    if (Session.get('notes'))
      Session.get('notes')[Session.get('rootNote')]

  rootNoteValue: () ->
    Session.get('rootNote')

  waveShape: () ->
    if (Session.get('waveShapes'))
      Session.get('waveShapes')[Session.get('waveShape')]

  waveShapeValue: () ->
    Session.get('waveShape')

  delay: () ->
    Session.get('delay')

  scales: () ->
    scales = []
    for key of Session.get('scales')
      scales.push(key)
    scales

  tempo: () ->
    Session.get('tempo')

  chordProgression: () ->
    chords = []
    for key of Session.get('chordProgressions')
      chords.push(key)
    chords

  bpm: () ->
    flipSetPosition(Math.floor(Session.get('tempo') / 10), 60, 200)

  bars: () ->
    Session.get('chordProgression')
