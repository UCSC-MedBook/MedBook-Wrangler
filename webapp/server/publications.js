Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submissionId) {
  check(submissionId, String);

  ensureSubmissionAvailable(this.userId, submissionId);
  return [
    Superpathways.find({}), // TODO: move this elsewhere
    WranglerSubmissions.find(submissionId),
    WranglerFiles.find({
      "submission_id": submissionId,
    }),
    Blobs.find({
      "metadata.submission_id": submissionId,
    }),
  ];
});

Meteor.publish('documentCounts', function(submissionId) {
  check(submissionId, String);
  ensureSubmissionAvailable(this.userId, submissionId);

  var self = this;
  function publishCounts (collectionName) {
    Counts.publish(self, collectionName, WranglerDocuments.find({
      "submission_id": submissionId,
      "collection_name": collectionName,
    }));
  }

  publishCounts("superpathways");
  publishCounts("superpathway_elements");
  publishCounts("superpathway_interactions");
  publishCounts("mutations");
  publishCounts("gene_expression");

  Counts.publish(self, "all-documents", WranglerDocuments.find({
    "submission_id": submissionId,
  }));

  Counts.publish(self, "all-files", WranglerFiles.find({
    "submission_id": submissionId,
  }));
});
