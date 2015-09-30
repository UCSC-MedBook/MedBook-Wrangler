_ = lodash;

//
// Meteor methods
//

makeSureLoggedIn = function() {
  var user_id = Meteor.user() && Meteor.user()._id;
  if (!user_id) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return user_id;
};

ensureSubmissionAvailable = function (user_id, submission_id) {
  var submission = WranglerSubmissions.findOne(submission_id);

  if (submission && submission.user_id === user_id) {
    return submission;
  }

  throw new Meteor.Error("submission-not-available");
};

ensureSubmissionEditable = function (user_id, submission_id) {
  var submission = ensureSubmissionAvailable(user_id, submission_id);

  if (submission.status === "editing") {
    return submission;
  }

  throw new Meteor.Error("submission-not-editable");
};

getSubmissionTypes = function (submission_id) {

  function getSubmissionTypeCount(submission_type) {
    if (Meteor.isClient) {
      return Counts.get("type_" + submission_type);
    } else {
      return WranglerDocuments.find({
        "submission_id": submission_id,
        "submission_type": submission_type,
      }).count();
    }
  }

  var submissionTypes = [];
  var possibleTypes = WranglerDocuments.simpleSchema()
      .schema()
      .submission_type
      .allowedValues;

  _.each(possibleTypes, function (submission_type) {
    if (getSubmissionTypeCount(submission_type) > 0) {
      submissionTypes.push(submission_type);
    }
  });

  return submissionTypes;
};
