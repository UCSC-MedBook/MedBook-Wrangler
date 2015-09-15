// TODO: just put these in as updates/inserts (security in allow rules)

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
    ensureSubmissionAvailable(userId, submissionId);

    WranglerSubmissions.remove(submissionId);
  },

  // WranglerFiles methods
  addFile: function (submissionId, fileId, fileName) {
    // fileName sent so it can be fast on the client
    // (Blobs is not published at this point)
    // (the file is inserted and then removed because it's not published)
    check([submissionId, fileId, fileName], [String]);

    var userId = makeSureLoggedIn();
    ensureSubmissionAvailable(userId, submissionId);

    if (Meteor.isServer) {
      var file = Blobs.findOne(fileId);
      if (!file.metadata) {
        throw new Meteor.Error("file-lacks-metadata", "File metadata not set");
      }
      if (file.metadata.user_id !== Meteor.userId() ||
          file.metadata.submission_id !== submissionId) {
        throw new Meteor.Error("file-metadata-wrong", "File metadata is wrong");
      }
      if (file.original.name !== fileName) {
        throw new Meteor.Error("file-name-wrong",
            "Why would you want to change the fileName?");
      }
    }

    WranglerFiles.insert({
      "submission_id": submissionId,
      "file_id": fileId,
      "file_name": fileName,
      "status": Meteor.isClient ? "creating" : "uploading",
    });
  },
  removeFile: function (submissionId, wranglerFileId) {
    check(submissionId, String);
    check(wranglerFileId, String);

    ensureSubmissionAvailable(makeSureLoggedIn(), submissionId);
    var wranglerFile =
        ensureWranglerFileAvailable(submissionId, wranglerFileId);

    WranglerDocuments.remove({ "wrangler_file_id": wranglerFileId });

    Blobs.remove(wranglerFile.file_id);

    WranglerFiles.remove(wranglerFileId);

    // TODO: call this for everything that is uncompressed from this
  },

  // editing_file
  setEditingFile: function (submissionId, wranglerFileId) {
    check([submissionId, wranglerFileId], [String]);
    ensureSubmissionAvailable(makeSureLoggedIn(), submissionId);
    ensureWranglerFileAvailable(submissionId, wranglerFileId);

    WranglerSubmissions.update(submissionId, {
      $set: { "editing_file": wranglerFileId }
    });
  },
  unsetEditingFile: function (submissionId) {
    check(submissionId, String);
    var submission = ensureSubmissionAvailable(makeSureLoggedIn(),
        submissionId);

    WranglerSubmissions.update(submissionId, {
      $unset: { "editing_file": 1 }
    });
  },
  unsetManualFileType: function (submissionId) {
    check(submissionId, String);
    var submission = ensureSubmissionAvailable(makeSureLoggedIn(),
        submissionId);

    WranglerFiles.update(submission.editing_file, {
      $unset: { "manual_file_type": 1 }
    });
  },
  setManualFileType: function (submissionId, fileType) {
    check([submissionId, fileType], [String]);
    var submission = ensureSubmissionAvailable(makeSureLoggedIn(),
        submissionId);

    WranglerFiles.update(submission.editing_file, {
      $set: {
        "manual_file_type": fileType
      }
    });
  },

  // WranglerDocument methods
  insertDocument: function (document) {
    check(document, WranglerDocuments.simpleSchema());
    ensureSubmissionAvailable(makeSureLoggedIn(), document.submission_id);

    WranglerDocuments.insert(document);
  },
  removeAllDocuments: function (submissionId, collectionName) {
    check(submissionId, String);
    check(collectionName, String);
    ensureSubmissionAvailable(makeSureLoggedIn(), submissionId);

    WranglerDocuments.remove({
      "submission_id": submissionId,
      "collection_name": collectionName,
    });
  },

  // TODO: DEBUG REMOVE BEFORE PRODUCTION
  removeAll: function() {
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
