_ = lodash;

//
// Meteor methods
//

ensureLoggedIn = function() {
  var user_id = Meteor.user() && Meteor.user()._id;
  if (!user_id) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return user_id;
};

ensureSubmissionOwnership = function (user_id, submission_id) {
  var submission = WranglerSubmissions.findOne(submission_id);

  if (submission && submission.user_id === user_id) {
    return submission;
  }

  throw new Meteor.Error("submission-not-available");
};

ensureSubmissionEditable = function (user_id, submission_id) {
  var submission = ensureSubmissionOwnership(user_id, submission_id);

  if (submission.status === "editing") {
    return submission;
  }

  throw new Meteor.Error("submission-not-editable");
};

getSubmissionTypes = function (submission_id) {
  var wranglerFiles = WranglerFiles.find().fetch();

  var uniqueTypes = _.uniq(_.pluck(wranglerFiles, 'submission_type'));
  filtered = _.filter(uniqueTypes, function (value) {
    return value !== "metadata";
  });

  if (filtered.length === 0 && uniqueTypes.indexOf("metadata") !== -1) {
    return ["metadata"];
  }
  return filtered;
};
