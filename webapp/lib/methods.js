Meteor.methods({
  // WranglerSubmission methods
  createSubmission: function () {
    var userId = makeSureLoggedIn();

    return WranglerSubmissions.insert({
      "user_id": userId,
      "date_created": new Date(),
      "status": "editing",
    });
  },
  deleteSubmission: function (submission_id) {
    check(submission_id, String);

    var userId = makeSureLoggedIn();
    ensureSubmissionEditable(userId, submission_id);

    // TODO: remove actual objects from the database, if inserted

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
    // (Blobs is not published at this point)
    // (the file is inserted and then removed because it's not published)
    check([submission_id, blobId, blobName], [String]);

    var userId = makeSureLoggedIn();
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

    if (Meteor.isServer){
      Jobs.insert({
        "name": "ParseWranglerFile",
        "user_id": userId,
        "date_created": new Date(),
        "args": {
          "wrangler_file_id": wranglerFileId,
        },
      });
    }
  },
  removeWranglerFile: function (wranglerFileId) {
    check(wranglerFileId, String);

    var wranglerFile = WranglerFiles.findOne(wranglerFileId);
    var submission_id = wranglerFile.submission_id;
    var user_id = makeSureLoggedIn();
    ensureSubmissionEditable(user_id, submission_id);

    WranglerFiles.remove(wranglerFileId);

    WranglerDocuments.remove({
      "submission_id": submission_id,
      "wrangler_file_id": wranglerFileId,
    });
    Blobs.remove(wranglerFile.blob_id);

    Jobs.remove({
      name: "ParseWranglerFile",
      user_id: user_id,
      args: {
        "wrangler_file_id": wranglerFileId,
      },
      status: "waiting",
    });
  },
  reparseWranglerFile: function (wranglerFileId) {
    check(wranglerFileId, String);
    // check newOptions down below

    var wranglerFile = WranglerFiles.findOne(wranglerFileId);
    if (wranglerFile) {
      var userId = makeSureLoggedIn();
      ensureSubmissionEditable(userId, wranglerFile.submission_id);

      WranglerFiles.update(wranglerFileId, {
        $set: { status: "processing" }
      });

      if (Meteor.isServer) {
        var newJob = {
          name: "ParseWranglerFile",
          user_id: userId,
          args: {
            wrangler_file_id: wranglerFileId,
          },
          status: "waiting",
        };

        // only add the new job if it's not already there
        if (!Jobs.findOne(newJob)) {
          Jobs.insert(newJob);
        }
      }
    } else {
      throw new Meteor.Error("document-does-not-exist");
    }
  },

  // // TODO: DEBUG REMOVE BEFORE PRODUCTION
  // clean: function() {
  //   // only allow Teo's user id
  //   if (Meteor.isServer) {
  //     Blobs.remove({});
  //     WranglerSubmissions.remove({});
  //     WranglerFiles.remove({});
  //     WranglerDocuments.remove({});
  //     Jobs.remove({});
  //     console.log("Teo removed all the wrangler data");
  //   } else {
  //     console.log("you're not the server, silly stub");
  //   }
  // },
});
