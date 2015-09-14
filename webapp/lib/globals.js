_ = lodash;

//
// Meteor methods
//

makeSureLoggedIn = function() {
  var userId = Meteor.user() && Meteor.user()._id;
  if (!userId) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return userId;
};

ensureSubmissionAvailable = function (userId, submissionId) {
  var submission = WranglerSubmissions.findOne(submissionId);
  if (submission.user_id !== userId) {
    throw new Meteor.Error("submission-not-available",
        "The submission _id provided does not exist or is not available" +
        " to you");
  }
  return submission;
};

ensureWranglerFileAvailable = function (submissionId, wranglerFileId) {
  var wranglerFile = WranglerFiles.findOne({
    "submission_id": submissionId,
    "_id": wranglerFileId
  });
  if (!wranglerFile) {
    throw new Meteor.Error("wrangler-file-not-available",
        "The wrangler file _id provided does not exist or is not available" +
        " to you");
  }
  return wranglerFile;
};

getDocumentTypes = function (submissionId) {

  function getCollectionCount(collectionName) {
    if (Meteor.isClient) {
      return Counts.get(collectionName);
    } else {
      return WranglerDocuments.find({
        "submission_id": submissionId,
        "collection_name": collectionName,
      }).count();
    }
  }

  var documentTypes = [];

  if (getCollectionCount("superpathways") > 0 ||
      getCollectionCount("superpathway_elements") > 0 ||
      getCollectionCount("superpathway_interactions") > 0) {
    documentTypes.push("superpathway");
  }

  if (getCollectionCount("mutations") > 0) {
    documentTypes.push("mutation");
  }

  return documentTypes;
};
