FS.debug = true;

Meteor.methods({
  startFileUpload: function (information) {

    var currentUserId = Meteor.user() && Meteor.user()._id;
    if (!currentUserId) {
      throw new Meteor.Error(403, "not logged in");
    }

    Meteor.users.update({ _id: currentUserId }, {
      $set: {
        "profile.uploadedDocument": information
      }
    });
  },
});
