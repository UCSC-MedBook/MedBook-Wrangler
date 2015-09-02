Meteor.methods({
  createSubmission: function () {
    var userId = makeSureLoggedIn();

    return WranglerSubmissions.insert({
      "user_id": userId,
      "created_at": new Date(),
      "status": Meteor.isClient ? "creating" : "editing",
    });
  },
  deleteSubmission: function (submissionId) {
    check(submissionId, String);

    var userId = makeSureLoggedIn();

    var submission = WranglerSubmissions.findOne(submissionId);
    if (submission.user_id !== userId) {
      throw new Meteor.Error("submission-not-available",
          "The submission _id provided does not exist or is not available" +
          " to you");
    }

    WranglerSubmissions.remove(submissionId);
  },
  addFileToSubmission: function (submissionId, fileId, fileName) {
    // fileName sent so it can be fast on the client
    // (Blobs is not published at this point)
    // (the file is inserted and then removed because it's not published)
    check([submissionId, fileId, fileName], [String]);

    var userId = makeSureLoggedIn();

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

    var submission = WranglerSubmissions.findOne(submissionId);
    if (!submission || submission.user_id !== userId ||
        submission.status !== "editing") {
      throw new Meteor.Error("submission-not-available",
          "The submission _id provided does not exist or is not available" +
          " to you");
    }

    WranglerSubmissions.update(submissionId, {
      $addToSet: {
        "files": {
          "file_id": fileId,
          "file_name": fileName,
          "status": Meteor.isClient ? "creating" : "uploading",
        }
      }
    });
  },
  removeFile: function (submissionId, fileId) {
    check(submissionId, String);
    check(fileId, String);

    var userId = makeSureLoggedIn();
    if (Meteor.isServer) {
      var file = Blobs.findOne(fileId);
      if (file.metadata.user_id !== Meteor.userId() ||
          file.metadata.submission_id !== submissionId) {
        throw new Meteor.Error("file-not available",
            "The file is either not yours or is from the wrong submission");
      }
    }

    WranglerDocuments.remove({ "file_id": fileId });

    WranglerSubmissions.update(submissionId, {
      $pull: {
        "files": {
          "file_id": fileId
        }
      }
    });

    // TODO: call this for everything that is uncompressed from this

    Blobs.remove(this.file_id);
  },

  updateAllDocuments: function (submissionId, collectionNames, setPart) {
    check(submissionId, String);
    check(collectionNames, [String]);
    check(setPart, {
      "superpathway_id": Match.Optional(String),
    });

    // TODO: validate input

    var prospectivePartUpdate = {};
    _.mapObject(setPart, function(value, key) {
      prospectivePartUpdate["prospective_document." + key] = value;
    });

    console.log("prospectivePartUpdate:", prospectivePartUpdate);

    WranglerDocuments.update({
          "submission_id": submissionId,
          "collection_name": {
            $in: ["network_elements", "network_interactions"]
          },
        }, { $set: prospectivePartUpdate },
        { multi: true });
  },


  // TODO: DEBUG REMOVE BEFORE PRODUCTION
  removeWranglerData: function() {
    // only allow Teo's user id
    if (Meteor.isServer) {
      Blobs.remove({});
      WranglerSubmissions.remove({});
      WranglerDocuments.remove({});
      console.log("Teo removed all the wrangler data");
    } else {
      console.log("you're not the server, silly stub");
    }
  },
});
