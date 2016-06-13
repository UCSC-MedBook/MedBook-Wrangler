Meteor.methods({
  removeTestingData: function () {
    var user = MedBook.ensureUser(Meteor.userId());

    if (user.getCollaborations().indexOf("testing") >= 0) {
      console.log("removing testing data");

      GeneExpression.remove({
        collaborations: "testing",
      });

      Expression2.remove({
        Collaborations: "testing",
      });

      IsoformExpression.remove({
        collaborations: "testing",
      });

      Studies.update({
        collaborations: "testing",
      }, {
        $set: {
          Sample_IDs: [],
          Patient_IDs: [],
        }
      });

      CRFs.remove({
        CRF: "Clinical_Info",
        Study_ID: "prad_test",
      });

      Contrasts.remove({
        collaborations: "testing",
      });

      Signatures.remove({
        collaborations: "testing",
      });

      return "done";
    }

    throw new Meteor.Error("you can't do that!");
  },
  // Associate an existing blob with a
  // file submission
  attachBlobToSubmission: function (submissionID, blobID) {
    check(submissionID, String);
    check(blobID, String);

    // Confirm blob exists and doesn't already
    // have submission metadata
    var existingBlob = Blobs.findOne({_id: blobID});
    if( existingBlob === undefined){
      throw new Meteor.Error("no-blob-found",
        "Couldn't find a blob with the provided _id.");
    }
    console.log("found existingBlob", existingBlob);
    if (existingBlob.metadata != undefined) {
      throw new Meteor.Error("blob-has-metadata",
        "Provided blob already has submission-associated metadata");
    }
    // Confirm submission exists
    existingSubmission = WranglerSubmissions.findOne({_id: submissionID});
    if(existingSubmission === undefined){
      throw new Meteor.Error("no-submission-found",
        "Couldn't find submission with provided _id");
    }
    // Add the metadata to the blob associating it with user and submission.
    var addMetadataModifier = {$set:
      {
        "metadata.user_id": Meteor.userId(),
        "metadata.submission_id":submissionID,
        //"metadata.wrangler_upload": true,
        // Don't set wrangler_upload to true. This would cause the blob to be
        // deleted if the submission is deleted.
      }
    };
    // Don't call Blobs.update with a callback but block instead.
    //  errors will flow to the client-side callback.
    var updateRes = Blobs.update(existingBlob._id, addMetadataModifier);
    if (updateRes !== 1){
      throw new Meteor.Error("bad-blob-count-updated",
        "Expected to update 1 blob but updated " + updateRes + " instead.");
    }
    return existingBlob;
  },
});
