function validateAll(submission) {

}

Meteor.methods({
  // TODO: what happens if the client quits before this is done?
  submitData: function (submissionId) {
    check(submissionId, String);
    console.log("they submitted it!");

    var userId = makeSureLoggedIn();

    var submission = WranglerSubmissions.findOne(submissionId);
    if (!submission || submission.user_id !== userId) {
      throw new Meteor.Error("submission-not-available",
          "The submission _id provided does not exist or is not available" +
          " to you");
    }

    WranglerSubmissions.update(submissionId, {
      $set: { "status": "validating" }
    });

    var noErrors = true;
    // foreach of WranglerDocuments with this submission._id

    if (noErrors) {
      // foreach to add them all
    }

  },
});
