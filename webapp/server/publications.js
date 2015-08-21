Meteor.publish("wranglerSubmission", function (submissionId) {
  check(submissionId, String);
  // TODO: make sure the user_id for that one is same as logged in

  var submission = WranglerSubmissions.findOne(submissionId);
  if (submission) {
    return [
      WranglerSubmissions.find(submissionId),
      WranglerDocuments.find({ // TODO: move this to template-level
        "submission_id": submissionId
      }),
      // UploadedFiles.find({
      //   "_id": { $in: _.pluck(submission.files, "file_id") }
      // })
    ];
  } else {
    this.ready();
  }
});

// Meteor.publish("wranglerDocuments", function (submissionId, collectionName) {
//   check(submissionId, String);
//   // TODO: make sure the user_id for that one is same as logged in
//
//   var submission = WranglerSubmissions.findOne(submissionId);
//   if (submission) {
//     return [
//       WranglerSubmissions.find(submissionId),
//       WranglerDocuments.find({ // TODO: move this to template-level
//         "submission_id": submissionId
//       }),
//       // UploadedFiles.find({
//       //   "_id": { $in: _.pluck(submission.files, "file_id") }
//       // })
//     ];
//   } else {
//     this.ready();
//   }
// });
