Meteor.publish("listSubmissions", function () {
  // no security needed really
  return WranglerSubmissions.find({
    "user_id": this.userId,
  });
});

Meteor.publish("wranglerSubmission", function (submission_id) {
  check(submission_id, String);

  var user = MedBook.ensureUser(this.userId);
  var submission = WranglerSubmissions.findOne(submission_id);
  user.ensureAccess(submission);

  var collaborations = user.getCollaborations();

  return [
    WranglerSubmissions.find(submission_id),
    WranglerFiles.find({ submission_id: submission_id }),
    Studies.find({
      "collaborations": { $in: collaborations },
    }),
    Collaborations.find({
      name: { $in: collaborations },
    }),
  ];
});

Meteor.publish("specificBlob", function (blob_id) {
  check(blob_id, String);

  // no security needed
  return Blobs.find({
    _id: blob_id,
    "metadata.user_id": this.userId,
  });
});

Meteor.publish("wranglerDocuments",
    function(submission_id, document_type, queryOptions) {
  check([submission_id, document_type], [String]);
  check(queryOptions, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  var submission = WranglerSubmissions.findOne(submission_id);
  user.ensureAccess(submission);

  return WranglerDocuments.find({
    submission_id: submission_id,
    document_type: document_type,
  }, queryOptions);
});

Meteor.publish("wranglerDocumentCounts",
    function (submission_id, document_type) {
  check([submission_id, document_type], [String]);

  var user = MedBook.ensureUser(this.userId);
  var submission = WranglerSubmissions.findOne(submission_id);
  user.ensureAccess(submission);

  // NOTE: seperate publish so it doesn't rereun every time they ask for more
  Counts.publish(this, document_type, WranglerDocuments.find({
    submission_id: submission_id,
    document_type: document_type,
  }));
});
Moko.ensureIndex(WranglerDocuments, {
  // NOTE: goes with "wranglerDocumentCounts" publish
  submission_id: 1,
  document_type: 1,
});

Meteor.publish("wranglerFiles", function (submission_id) {
  check(submission_id, String);

  var user = MedBook.ensureUser(this.userId);
  var submission = WranglerSubmissions.findOne(submission_id);
  user.ensureAccess(submission);

  return WranglerFiles.find({
    submission_id: submission_id
  });
});

Meteor.publish("updatableContrasts", function () {
  var collaborations = MedBook.ensureUser(this.userId).getCollaborations();
  return Contrasts.find({
    collaborations: { $in: collaborations }
  });
});

Meteor.publish("updatableSignatures", function () {
  var collaborations = MedBook.ensureUser(this.userId).getCollaborations();
  return Signatures.find({
    collaborations: { $in: collaborations }
  });
});

// publications specifically for testing

Meteor.publish("geneExpressionTesting", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return GeneExpression.find({
      collaborations: "testing"
    }, options);
  }

  this.ready();
});

Meteor.publish("expression2Testing", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return Expression2.find({
      Collaborations: "testing"
    }, options);
  }

  this.ready();
});

Meteor.publish("isoformExpressionTesting", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return IsoformExpression.find({
      collaborations: "testing"
    }, options);
  }

  this.ready();
});

Meteor.publish("studyTesting", function () {
  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return [
      Studies.find({
        collaborations: { $in: ["testing", "public"] }
      }),
      CRFs.find({
        CRF: "Clinical_Info",
        Study_ID: "prad_test",
      }),
    ];
  }

  this.ready();
});

Meteor.publish("contrastTesting", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return Contrasts.find({ collaborations: "testing" }, options);
  }

  this.ready();
});

Meteor.publish("geneAnnotationTesting", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return GeneAnnotation.find({
      collaborations: "testing"
    }, options);
  }

  this.ready();
});

Meteor.publish("signatureTesting", function (options) {
  check(options, Object); // TODO: can they do anything fancy here?

  var user = MedBook.ensureUser(this.userId);
  if (user.getCollaborations().indexOf("testing") >= 0) {
    return Signatures.find({ collaborations: "testing" }, options);
  }

  this.ready();
});
