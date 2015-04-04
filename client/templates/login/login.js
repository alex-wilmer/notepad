Template.login.helpers({
  userName: function () {
    if (Meteor.user()) {
      return Meteor.user().profile.name;
    }
  }
});

Template.login.events({
  'click .fa-github': function () {
    Meteor.loginWithGithub({
      requestPermissions: ['user', 'public_repo']
    }
    , function (err) {
      if (err) {
        Session.set('errorMessage', err.reason || 'Unknown error');
      }

      else {
        $('.modal').closeModal();
      }
    });
  }

, 'click .modal-trigger': function (event) {
    $(event.target.hash).openModal();
  }

, 'click .sign-out': function () {
    Meteor.logout();
    $('.modal').closeModal();
  }

, 'click .cancel': function () {
    $('.modal').closeModal();
  }
});
