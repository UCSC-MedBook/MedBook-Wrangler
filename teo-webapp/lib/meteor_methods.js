Meteor.methods({
  assertLoggedIn: function () {
    var currentUserId = Meteor.user() && Meteor.user()._id;
    if (!currentUserId) {
      throw new Meteor.Error(403, "not logged in");
    }
    return currentUserId;
  },
  setUploadedFile: function (information) {
    var currentUserId = Meteor.call("assertLoggedIn");
    Meteor.users.update({ _id: currentUserId }, {
      $set: {
        "profile.uploadedDocument": information
      }
    });
  },
});
