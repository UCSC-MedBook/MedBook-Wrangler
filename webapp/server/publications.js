Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submissionId) {
  check(submissionId, String);

  ensureSubmissionAvailable(this.userId, submissionId);
  return WranglerSubmissions.find(submissionId);
});

Meteor.publish("superpathways", function () {
  return Superpathways.find({});
});
