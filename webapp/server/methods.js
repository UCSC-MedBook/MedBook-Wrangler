Meteor.methods({
  // Associate an existing blob with a
  // file submission
  attachBlobToSubmission: function (submissionID, blobID) {
    check(submissionID, String);
    check(blobID, String);

    var user = MedBook.ensureUser(Meteor.userId());

    // Grab the submission, make sure the user has access
    existingSubmission = WranglerSubmissions.findOne({_id: submissionID});
    user.ensureAccess(existingSubmission);
    ensureEditable(existingSubmission);

    // Confirm blob exists and doesn't already
    // have submission metadata
    var existingBlob = Blobs.findOne({_id: blobID});
    if( existingBlob === undefined){
      throw new Meteor.Error("no-blob-found",
        "Couldn't find a blob with the provided _id.");
    }

    if (existingBlob.metadata && existingBlob.metadata.submission_id) {
      throw new Meteor.Error("blob-already-attached-to-submission",
        "Provided blob already has submission-associated metadata");
    }

    // Add the metadata to the blob associating it with user and submission.
    var addMetadataModifier = {
      $set: {
        // XXX: someone could claim a blob if they have the _id
        "metadata.user_id": Meteor.userId(),
        "metadata.submission_id":submissionID,
        // Don't set wrangler_upload to true. This would cause the blob to be
        // deleted if the submission is deleted.
        // "metadata.wrangler_upload": true,
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
