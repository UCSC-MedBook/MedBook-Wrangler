makeSureLoggedIn = function() {
  var userId = Meteor.user() && Meteor.user()._id;
  if (!userId) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return userId;
}
