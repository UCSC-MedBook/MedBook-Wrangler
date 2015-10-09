Meteor.methods({
  // TODO: what happens if the client quits before this is done?
  submitSubmission: function (submission_id) {
    check(submission_id, String);

    var userId = makeSureLoggedIn();
    var submission = ensureSubmissionEditable(userId, submission_id);

    WranglerSubmissions.update(submission_id, {$set: {"status": "validating"}});

    var jobId = Jobs.insert({
      "name": "submitWranglerSubmission",
      user_id: userId,
      "date_created": new Date(),
      "args": {
        "submission_id": submission_id,
      },
    });
    console.log("added job:", jobId);
  },
});
