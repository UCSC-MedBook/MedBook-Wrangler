function makeSureLoggedIn() {
  var userId = Meteor.user() && Meteor.user()._id;
  if (!userId) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return userId;
}

Meteor.methods({
  createSubmission: function () {
    var userId = makeSureLoggedIn();

    return WranglerSubmissions.insert({
      "user_id": userId,
    });
  },
  addFileToSubmission: function (submissionId, fileId, fileName) {
    check(submissionId, String);
    check(fileId, String);
    check(fileName, String);
    var userId = makeSureLoggedIn();

    if (Meteor.isServer) {
      var file = UploadedFiles.findOne(fileId);
      if (!file || userId !== file.user_id) {
        throw new Meteor.Error("file-not-available",
            "The file _id provided does not exist or is not available to you");
      }
      if (file.original.name !== fileName) {
        throw new Meteor.Error("file-name-wrong",
            "Why would you want to change the fileName?");
      }

      var submission = WranglerSubmissions.findOne(submissionId);
      if (!submission || submission.user_id !== userId) {
        throw new Meteor.Error("submission-not-available",
            "The submission _id provided does not exist or is not available" +
            " to you");
      }
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

    }

    WranglerSubmissions.update(submissionId, {
      $pull: {
        "files": {
          "file_id": fileId
        }
      }
    });
    UploadedFiles.remove(this.file_id);
  },

  // TODO: DEBUG REMOVE BEFORE PRODUCTION
  removeWranglerData: function() {
    // only allow Teo's user id
    if (Meteor.userId() === "yKWxvJi5ouvbjqjRQ") {
      if (Meteor.isServer) {
        UploadedFiles.remove({});
        WranglerSubmissions.remove({});
        console.log("Teo removed all the wrangler data");
      } else {
        console.log("you're not the server, silly stub");
      }
    } else {
      console.log("someone tried to do it who wasn't me");
    }
  },
});
