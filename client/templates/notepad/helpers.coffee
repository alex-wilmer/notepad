Template.notepad.helpers
  active: () ->
    Session.get('secondMenu')

  key: () ->
    if Session.get('notes')
      Session.get('notes')[Session.get('rootNote')]

  waveShapeName: () ->
    if Session.get('waveShapes')
      Session.get('waveShapes')[Session.get('waveShape')]

  waveShape: () ->
    Session.get('waveShape')

  scales: () ->
    scales = []
    for key of Session.get('scales')
      scales.push(key)
    scales

  chordProgression: () ->
    chords = []
    for key of Session.get('chordProgressions')
      chords.push(key)
    chords

  bpm: () ->
    flipSetPosition(Math.floor(Session.get('tempo') / 10), 60, 200)

  bars: () ->
    Session.get('chordProgression')

  chordSounds: () ->
    Session.get('chordSounds')
