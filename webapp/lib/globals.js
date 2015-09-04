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

//
// General
//

getCollectionByName = function(collectionName) {
  switch (collectionName) {
    case "network_elements":
      return NetworkElements;
    case "network_interactions":
      return NetworkInteractions;
    case "mutations":
      return Mutations;
    case "gene_expression":
      return GeneExpression;
    case "superpathways":
      return Superpathways;
    default:
      console.log("couldn't find appropriate schema");
      return null;
  }
};

getSchemaFromName = function(collectionName) {
  var collection = getCollectionByName(collectionName);
  if (collection)
    return collection.simpleSchema();
  return null;
};
