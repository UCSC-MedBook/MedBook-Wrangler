Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submission_id) {
  check(submission_id, String);

  try {
    ensureSubmissionAvailable(this.userId, submission_id);

    var collaborations = ['public'];
    var user = Meteor.users.findOne(this.userId);
    if (user && user.profile && user.profile.collaborations) {
      collaborations = collaborations.concat(user.profile.collaborations);
    }
    return [
      Superpathways.find({}), // TODO: move this elsewhere
      WranglerSubmissions.find(submission_id),
      WranglerFiles.find({
        "submission_id": submission_id,
      }),
      Studies.find({
        "collaborations.0": { $in: collaborations },
      }),
      Collaborations.find({
        "name": { $in: collaborations },
      }),
    ];
  } catch (e) {
    console.log("e:", e);
  }

  this.ready();
});

Meteor.publish("addSubmissionDocuments", function (submission_id) {
  check(submission_id, String);

  try {
    ensureSubmissionAvailable(this.userId, submission_id);
    return WranglerDocuments.find({submission_id: submission_id});
  } catch (e) {
    this.ready();
  }
});

Meteor.publish("specificBlob", function (blob_id) {
  check(blob_id, String);

  return Blobs.find({
    _id: blob_id,
    'metadata.user_id': this.userId,
  });
});

Meteor.publish('documentCounts', function(submission_id) {
  var self = this;

  check(submission_id, String);
  try {
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
  } catch (e) {}
  this.ready();
});
