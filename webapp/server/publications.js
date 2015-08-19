Meteor.publish("wranglerSubmission", function (id) {
  check(id, String);
  // TODO: make sure the user_id for that one is same as logged in

  var submission = WranglerSubmissions.findOne(id);
  if (submission) {
    return [
      WranglerSubmissions.find(id),
      // UploadedFiles.find({
      //   "_id": { $in: _.pluck(submission.files, "file_id") }
      // })
    ];
  } else {
    this.ready();
  }
});
