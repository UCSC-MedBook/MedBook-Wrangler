makeSureLoggedIn = function() {
  var userId = Meteor.user() && Meteor.user()._id;
  if (!userId) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return userId;
};

getCollectionByName = function(collectionName) {
  switch (collectionName) {
    case "network_elements":
      return NetworkElements;
    case "network_interactions":
      return NetworkInteractions;
    case "mutations":
      return Mutations;
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
