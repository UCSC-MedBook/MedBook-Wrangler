Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submission_id) {
  check(submission_id, String);

  try {
    ensureSubmissionAvailable(this.userId, submission_id);

    var collabStrings = ['public'];
    var user = Meteor.users.findOne(this.userId);
    if (user && user.profile && user.profile.collaborations) {
      collabStrings = collabStrings.concat(user.profile.collaborations);
    }

    return [
      Superpathways.find({}), // TODO: move this elsewhere
      WranglerSubmissions.find(submission_id),
      WranglerFiles.find({ submission_id: submission_id }),
      Studies.find({
        "collaborations.0": { $in: collabStrings },
      }),
      Collabs.find({
        name: { $in: collabStrings },
      }),
    ];
  } catch (e) {
    console.log("e:", e);
  }

  this.ready();
});

Meteor.publish("specificBlob", function (blob_id) {
  check(blob_id, String);

  return Blobs.find({
    _id: blob_id,
    'metadata.user_id': this.userId,
  });
});

Meteor.publish('wranglerDocuments',
    function(submission_id, document_type, options) {
  return WranglerDocuments.find({
    submission_id: submission_id,
    document_type: document_type,
  }, options);
});
