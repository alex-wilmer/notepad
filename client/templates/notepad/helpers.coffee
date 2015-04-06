Template.notepad.helpers
  active: () ->
    Session.get('secondMenu')

  bars: () ->
    Session.get('chordProgression')

  bpm: () ->
    flipSetPosition(Math.floor(Session.get('tempo') / 10), 60, 200)

  chordProgression: () ->
    chords = []
    for key of Session.get('chordProgressions')
      chords.push(key)
    chords

  chordSounds: () ->
    Session.get('chordSounds')

  key: () ->
    if Session.get('notes')
      Session.get('notes')[Session.get('rootNote')]

  scales: () ->
    scales = []
    for key of Session.get('scales')
      scales.push(key)
    scales

  waveShape: () ->
    Session.get('waveShape')

  waveShapeName: () ->
    if Session.get('waveShapes')
      Session.get('waveShapes')[Session.get('waveShape')]
