Meteor.methods({
  // WranglerSubmission methods
  createSubmission: function () {
    var userId = makeSureLoggedIn();

    return WranglerSubmissions.insert({
      "user_id": userId,
      "date_created": new Date(),
      "status": Meteor.isClient ? "creating" : "editing",
    });
  },
  deleteSubmission: function (submissionId) {
    check(submissionId, String);

    var userId = makeSureLoggedIn();
    ensureSubmissionEditable(userId, submissionId);

    // TODO: remove actual objects from the database, if inserted

    WranglerFiles.find({ "submission_id": submissionId })
        .forEach(function (document) {
      Blobs.remove(document.file_id);
    });
    WranglerDocuments.remove({ "submission_id": submissionId });
    WranglerFiles.remove({ "submission_id": submissionId });
    WranglerSubmissions.remove(submissionId);
  },

  // WranglerFiles methods
  addFile: function (submissionId, fileId, fileName) {
    // fileName sent so it can be fast on the client
    // (Blobs is not published at this point)
    // (the file is inserted and then removed because it's not published)
    check([submissionId, fileId, fileName], [String]);

    var userId = makeSureLoggedIn();
    var submission = ensureSubmissionEditable(userId, submissionId);

    if (Meteor.isServer) { // must be on the server because Blobs not published
      var file = Blobs.findOne(fileId);
      if (!file.metadata) {
        throw new Meteor.Error("file-lacks-metadata", "File metadata not set");
      }
      if (file.metadata.user_id !== Meteor.userId() ||
          file.metadata.submission_id !== submissionId) {
        throw new Meteor.Error("file-metadata-wrong", "File metadata is wrong");
      }
      if (file.original.name !== fileName) {
        throw new Meteor.Error("file-name-wrong");
      }
    }

    WranglerFiles.insert({
      "submission_id": submissionId,
      "user_id": submission.user_id,
      "file_id": fileId,
      "file_name": fileName,
      "status": Meteor.isClient ? "creating" : "uploading",
    });
  },
  removeFile: function (submissionId, wranglerFileId) {
    check(submissionId, String);
    check(wranglerFileId, String);
    ensureSubmissionEditable(makeSureLoggedIn(), submissionId);

    var wranglerFile = WranglerFiles.findOne({
      "_id": wranglerFileId,
      "submission_id": submissionId, // security
    });

    WranglerDocuments.remove({ "wrangler_file_id": wranglerFileId });
    Blobs.remove(wranglerFile.file_id);
    WranglerFiles.remove(wranglerFileId);

    // TODO: call this for everything that is uncompressed from this
  },

  // TODO: DEBUG REMOVE BEFORE PRODUCTION
  clean: function() {
    // only allow Teo's user id
    if (Meteor.isServer) {
      Blobs.remove({});
      WranglerSubmissions.remove({});
      WranglerFiles.remove({});
      WranglerDocuments.remove({});
      Jobs.remove({});
      console.log("Teo removed all the wrangler data");
    } else {
      console.log("you're not the server, silly stub");
    }
  },
});
