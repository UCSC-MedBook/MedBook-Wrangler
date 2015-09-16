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

  if (submission && submission.user_id === userId) {
    return submission;
  }

  throw new Meteor.Error("submission-not-available");
};

ensureSubmissionEditable = function (userId, submissionId) {
  var submission = ensureSubmissionAvailable(userId, submissionId);

  if (submission.status === "editing") {
    return submission;
  }

  throw new Meteor.Error("submission-not-editable");
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

  if (getCollectionCount("gene_expression") > 0) {
    documentTypes.push("expression");
  }

  return documentTypes;
};
