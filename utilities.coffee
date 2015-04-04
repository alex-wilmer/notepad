@flipSetPosition = (n, first, last) ->
  -n + first + last

@getFrequency = (baseFrequency, semitones) ->
  baseFrequency * Math.pow(Math.pow(2, 1/12), semitones)
