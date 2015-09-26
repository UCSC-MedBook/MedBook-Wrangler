Meteor.methods({
  // TODO: what happens if the client quits before this is done?
  submitSubmission: function (submissionId) {
    check(submissionId, String);

    var submission = ensureSubmissionEditable(makeSureLoggedIn(), submissionId);

    WranglerSubmissions.update(submissionId, {$set: {"status": "validating"}});

    var jobId = Jobs.insert({
      "name": "submitWranglerSubmission",
      "date_created": new Date(),
      "args": {
        "submission_id": submissionId,
      },
    });
    console.log("added job:", jobId);
  },
});
