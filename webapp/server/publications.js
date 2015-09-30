Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submissionId) {
  check(submissionId, String);

  ensureSubmissionAvailable(this.userId, submissionId);
  var user = Meteor.users.findOne(this.userId);
  if (user) {
    var collaborations = user.profile.collaborations.concat(["public"]);
    return [
      Superpathways.find({}), // TODO: move this elsewhere
      WranglerSubmissions.find(submissionId),
      WranglerFiles.find({
        "submission_id": submissionId,
      }),
      Blobs.find({
        "metadata.submission_id": submissionId,
      }),
      Studies.find({
        "collaborations.0": { $in: collaborations },
      }),
      Collaborations.find({
        "name": { $in: collaborations },
      }),
    ];
  } else {
    this.ready();
  }
});

Meteor.publish('documentCounts', function(submission_id) {
  var self = this;

  check(submission_id, String);
  ensureSubmissionAvailable(self.userId, submission_id);

  var types = WranglerDocuments.simpleSchema()
      .schema()
      .submission_type
      .allowedValues;
  _.each(types, function (submission_type) {
    Counts.publish(self, "type_" + submission_type, WranglerDocuments.find({
      "submission_id": submission_id,
      "submission_type": submission_type,
    }));
  });

  Counts.publish(self, "all-documents", WranglerDocuments.find({
    "submission_id": submission_id,
  }));

  Counts.publish(self, "all-files", WranglerFiles.find({
    "submission_id": submission_id,
  }));
});
