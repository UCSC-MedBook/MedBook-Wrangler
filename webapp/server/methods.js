Meteor.methods({
  // TODO: what happens if the client quits before this is done?
  submitSubmission: function (submissionId) {
    check(submissionId, String);

    var userId = makeSureLoggedIn();
    var submission = ensureSubmissionEditable(userId, submissionId);

    WranglerSubmissions.update(submissionId, {$set: {"status": "validating"}});

    var jobId = Jobs.insert({
      "name": "submitWranglerSubmission",
      user_id: userId,
      "date_created": new Date(),
      "args": {
        "submission_id": submissionId,
      },
    });
    console.log("added job:", jobId);
  },
});
