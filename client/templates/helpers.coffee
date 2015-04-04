Template.registerHelper '$', ($) ->
  Session.get($)

Template.registerHelper 'equals', (a, b) ->
  a == b

Template.registerHelper 'currentSetting', () ->
  Session.get 'currentSetting'
