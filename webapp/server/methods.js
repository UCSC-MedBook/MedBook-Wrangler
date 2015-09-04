Meteor.methods({
  // TODO: what happens if the client quits before this is done?
  submitSubmission: function (submissionId) {
    check(submissionId, String);
    console.log("they submitted it!");

    var userId = makeSureLoggedIn();
    ensureSubmissionAvailable(userId, submissionId);

    function setSubmissionStatus(status) {
      WranglerSubmissions.update(submissionId, {
        $set: { "status": status }
      });
    }
    setSubmissionStatus("validating");

    // TODO: make a job submission here: don't make the client stay on the page

    var noErrors = true;
    WranglerDocuments.find({"submission_id": submissionId})
        .forEach(function (object) {
          if (noErrors) { // only if there are no errors so far
            var context = getSchemaFromName(object.collection_name)
                .newContext();
            if (context.validate(object.prospective_document)) {
              // console.log("we all good");
            } else {
              console.log("invalid document found!", context.invalidKeys());
              noErrors = false;
            }
          }
        });

    if (noErrors !== true) {
      setSubmissionStatus("editing");
      // TODO: should we email them or something?
      throw new Meteor.Error("submission-not-valid",
          "The submission has invalid objects");
    }

    setSubmissionStatus("writing");

    var updateGeneExpression = true;
    if (WranglerDocuments.findOne({
          "submission_id": submissionId,
          "collection_name": "gene_expression",
        })) {
      // TODO: update GeneExpressionSummary
    }

    // TODO: https://docs.mongodb.org/v3.0/tutorial/perform-two-phase-commits/
    WranglerDocuments.find({"submission_id": submissionId})
        .forEach(function (object) {
          getCollectionByName(object.collection_name)
              .insert(object.prospective_document);
          // WranglerDocuments.remove(object._id); // for now
        });

    setSubmissionStatus("done");
  },
});
