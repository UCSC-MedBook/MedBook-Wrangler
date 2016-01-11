Meteor.methods({
  // WranglerSubmission methods
  addSubmission: function (blobIds) {
    check(blobIds, Match.Optional([String]));

    var user_id = ensureLoggedIn();

    // check to make blobs are theirs, don't already belong to a submission
    var blobNames = [];
    _.each(blobIds, function (blobId, index) {
      var blob = Blobs.findOne(blobId);
      if (!blob || !blob.metadata || blob.metadata.user_id !== user_id) {
        throw "blob " + blobId + " does not exist or has incorrect metadata";
      }
      if (blob.metadata.submission_id) {
        throw "blob already belongs to another submission";
      }
      blobNames.push(blob.original.name);
    });

    var submission_id = WranglerSubmissions.insert({
      "user_id": user_id,
      "date_created": new Date(),
      "status": "editing",
    });

    // also insert wrangler files
    _.each(blobIds, function (blobId, index) {
      Blobs.update(blobId, {
        $set: {
          "metadata.submission_id": submission_id
        }
      });
      Meteor.call("addWranglerFile", submission_id, blobId, blobNames[index]);
    });

    return submission_id;
  },
  removeSubmission: function (submission_id) {
    check(submission_id, String);

    ensureSubmissionEditable(ensureLoggedIn(), submission_id);

    WranglerFiles.find({ "submission_id": submission_id })
        .forEach(function (document) {
      Blobs.remove(document.blob_id);
    });
    WranglerDocuments.remove({ "submission_id": submission_id });
    WranglerFiles.remove({ "submission_id": submission_id });
    WranglerSubmissions.remove(submission_id);
  },

  // WranglerFiles methods
  addWranglerFile: function (submission_id, blobId, blobName) {
    // blobName sent so it can be fast on the client
    // (Blobs is not published at this point, so the file is inserted
    // and then removed because it's not published)
    check([submission_id, blobId, blobName], [String]);

    var userId = ensureLoggedIn();
    var submission = ensureSubmissionEditable(userId, submission_id);

    if (Meteor.isServer) { // must be on the server because Blobs not published
      var file = Blobs.findOne(blobId);
      if (!file.metadata) {
        throw new Meteor.Error("file-lacks-metadata", "File metadata not set");
      }
      if (file.metadata.user_id !== Meteor.userId() ||
          file.metadata.submission_id !== submission_id) {
        throw new Meteor.Error("file-metadata-wrong", "File metadata is wrong");
      }
      if (file.original.name !== blobName) {
        throw new Meteor.Error("file-name-wrong");
      }
    }

    var wranglerFileId = WranglerFiles.insert({
      "submission_id": submission_id,
      "user_id": submission.user_id,
      "blob_id": blobId,
      "blob_name": blobName,
      "status": "uploading",
    });
  },
  removeWranglerFile: function (wranglerFileId) {
    check(wranglerFileId, String);

    var wranglerFile = WranglerFiles.findOne(wranglerFileId);
    var submission_id = wranglerFile.submission_id;
    var user_id = ensureLoggedIn();
    ensureSubmissionEditable(user_id, submission_id);

    WranglerFiles.remove(wranglerFileId);
    WranglerDocuments.update({
      "submission_id": submission_id,
      "wrangler_file_ids": wranglerFileId,
    }, {
      $pull: { wrangler_file_ids: wranglerFileId }
    }, {multi: true});
    WranglerDocuments.remove({
      "submission_id": submission_id,
      "wrangler_file_ids": {$size: 0},
    });
    Blobs.remove(wranglerFile.blob_id);

    // Jobs not subscribed
    if (Meteor.isServer) {
      Jobs.remove({
        name: "ParseWranglerFile",
        user_id: user_id,
        args: {
          "wrangler_file_id": wranglerFileId,
        },
        status: "waiting",
      });
    }
  },
  reparseWranglerFile: function (wranglerFileId) {
    check(wranglerFileId, String);

    var userId = ensureLoggedIn();
    var wranglerFile = WranglerFiles.findOne(wranglerFileId);
    ensureSubmissionEditable(userId, wranglerFile.submission_id);

    WranglerFiles.update(wranglerFileId, {
      $set: { status: "processing" }
    });

    var newJob = {
      name: "ParseWranglerFile",
      user_id: userId,
      args: {
        wrangler_file_id: wranglerFileId,
      },
      status: "waiting",
    };

    // only add the new job if it's not already there
    // this could be changed to an insert but the schema makes it annoying
    if (!Jobs.findOne(newJob)) {
      Jobs.insert(newJob);
    }
  },
  submitSubmission: function (submission_id) {
    check(submission_id, String);

    var user_id = ensureLoggedIn();
    var submission = ensureSubmissionEditable(user_id, submission_id);

    WranglerSubmissions.update(submission_id, {
      $set: {"status": "validating"}
    });

    Jobs.insert({
      "name": "SubmitWranglerSubmission",
      user_id: user_id,
      "date_created": new Date(),
      "args": {
        "submission_id": submission_id,
      },
    });
  },
});
