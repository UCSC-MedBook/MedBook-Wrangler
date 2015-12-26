Meteor.publish("listSubmissions", function () {
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submission_id) {
  check(submission_id, String);

  ensureSubmissionOwnership(this.userId, submission_id);

  var collabStrings = ['public'];
  var user = Meteor.users.findOne(this.userId);
  if (user && user.profile && user.profile.collaborations) {
    collabStrings = collabStrings.concat(user.profile.collaborations);
  }

  return [
    WranglerSubmissions.find(submission_id),
    WranglerFiles.find({ submission_id: submission_id }),
    Studies.find({
      "collaborations.0": { $in: collabStrings },
    }),
    Collabs.find({
      name: { $in: collabStrings },
    }),
  ];
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
  check([submission_id, document_type], [String]);
  check(options, Object); // TODO: can they do anything fancy here?
  ensureSubmissionOwnership(this.userId, submission_id);

  return WranglerDocuments.find({
    submission_id: submission_id,
    document_type: document_type,
  }, options);
});

Meteor.publish("wranglerDocumentCounts",
    function (submission_id, document_type) {
  check([submission_id, document_type], [String]);
  ensureSubmissionOwnership(this.userId, submission_id);

  // NOTE: seperate publish so it doesn't rereun every time they ask for more
  Counts.publish(this, document_type, WranglerDocuments.find({
    submission_id: submission_id,
    document_type: document_type,
  }));
});

Meteor.publish('wranglerFiles', function (submission_id) {
  check(submission_id, String);
  ensureSubmissionOwnership(this.userId, submission_id);

  return WranglerFiles.find({
    submission_id: submission_id
  });
});

// publications specifically for testing

Meteor.publish('geneExpressionTesting', function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = Meteor.users.findOne(this.userId);
  if (user.profile.collaborations.indexOf('testing') >= 0) {
    return GeneExpression.find({
      collaborations: 'testing'
    }, options);
  }

  this.ready();
});

Meteor.publish('expression2Testing', function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = Meteor.users.findOne(this.userId);
  if (user.profile.collaborations.indexOf('testing') >= 0) {
    return Expression2.find({
      Collaborations: 'testing'
    }, options);
  }

  this.ready();
});

Meteor.publish('isoformExpressionTesting', function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = Meteor.users.findOne(this.userId);
  if (user.profile.collaborations.indexOf('testing') >= 0) {
    return IsoformExpression.find({
      collaborations: 'testing'
    }, options);
  }

  this.ready();
});

Meteor.publish("studyTesting", function () {
  var user = Meteor.users.findOne(this.userId);
  if (user.profile.collaborations.indexOf('testing') >= 0) {
    return [
      Studies.find({
        collaborations: { $in: ['testing', 'public'] }
      }),
      CRFs.find({
        CRF: "Clinical_Info",
        Study_ID: "prad_test",
      }),
    ];
  }

  this.ready();
});
