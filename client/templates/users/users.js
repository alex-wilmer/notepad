Template.users.helpers({
  userName: function () {
    if (Meteor.user()) {
      var name = Meteor.user().profile || Meteor.user().username || '';
      return name;
    }
  }
});

Template.users.events({
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

, 'submit #login-form' : function (event) {
    event.preventDefault();

    var username = event.target.username
      , password = event.target.password

      , clearFields = function() {
        username.value = '';
        password.value = '';
      };

    Meteor.loginWithPassword(username.value, password.value, function(err) {
      if (err) {
        clearFields();
        return log(err);
      }

      clearFields();
      $('.modal').closeModal();
    });

    return false;
  }

, 'submit #sign-up-form': function (event) {
    event.preventDefault();

    var user = {
      username: event.target.username.value
    , password: event.target.password.value
    }

    Accounts.createUser(user, function() {
      $('.modal').closeModal();
      event.target.username.value = '';
      event.target.username.value = '';

      setTimeout(function() {
        $('.modal-trigger').leanModal();
      }, 10);
    });
  }
});
