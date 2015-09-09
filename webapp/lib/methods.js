// TODO: make sure in editing stage to change things

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
  addFileToSubmission: function (submissionId, fileId, fileName) {
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
  removeFileFromSubmission: function (submissionId, fileId) {
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

  // Specific methods
  setSuperpathway: function (submissionId, superpathwayName) {
    check([submissionId, superpathwayName], [String]);
    ensureSubmissionAvailable(makeSureLoggedIn(), submissionId);

    WranglerDocuments.remove({
      "submission_id": submissionId,
      "collection_name": "superpathways",
    });

    var oldOne = Superpathways.findOne({"name": superpathwayName},
        { sort: { version: -1 } });
    var newVersion = 1;
    if (oldOne) {
      newVersion = oldOne.version + 1;
    }
    WranglerDocuments.insert({
      "submission_id": submissionId,
      "collection_name": "superpathways",
      "prospective_document": {
        "name": superpathwayName,
        "version": newVersion,
      }
    });
  },
  setMutationDocuments: function (submissionId, insertDoc) {
    check(submissionId, String);
    check(insertDoc, Mutations.simpleSchema().pick([
      "biological_source",
      "mutation_impact_assessor",
    ]));
    ensureSubmissionAvailable(makeSureLoggedIn(), submissionId);

    WranglerDocuments.update({
      "submission_id": submissionId,
      "collection_name": "mutations",
    }, {
      $set: {
        // could put this into a loop if needed (grab from schema above)
        "prospective_document.biological_source": insertDoc.biological_source,
        "prospective_document.mutation_impact_assessor":
            insertDoc.mutation_impact_assessor,
      }
    }, { multi: true });
  },

  // TODO: DEBUG REMOVE BEFORE PRODUCTION
  removeWranglerData: function() {
    // only allow Teo's user id
    if (Meteor.isServer) {
      Blobs.remove({});
      WranglerSubmissions.remove({});
      WranglerDocuments.remove({});
      Jobs.remove({});
      console.log("Teo removed all the wrangler data");
    } else {
      console.log("you're not the server, silly stub");
    }
  },
});
