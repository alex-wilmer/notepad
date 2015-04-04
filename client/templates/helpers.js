Template.registerHelper('$',
  function ($) {
    return Session.get($);
  }
);
