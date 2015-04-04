@flipSetPosition = (n, first, last) ->
  first + last - n

@getFrequency = (baseFrequency, semitones) ->
  baseFrequency * Math.pow(Math.pow(2, 1/12), semitones)
