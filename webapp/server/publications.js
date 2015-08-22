Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submissionId) {
  check(submissionId, String);

  // ensure submission exists...
  var submission = WranglerSubmissions.findOne(submissionId);
  if (submission && submission.user_id === this.userId) {
    return WranglerSubmissions.find(submissionId);
  } else {
    this.ready();
  }
});

Meteor.publish("wranglerDocuments", function (submissionId, collectionName) {
  check(submissionId, String);
  check(collectionName, String);

  var submission = WranglerSubmissions.findOne(submissionId);
  if (submission && submission.user_id === this.userId) {
    return WranglerDocuments.find({
      "submission_id": submissionId,
      "collection_name": collectionName,
    });
  } else {
    this.ready();
  }
});
