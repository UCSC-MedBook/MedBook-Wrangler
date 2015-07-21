Meteor.startup(function () {
  console.log("Server is starting!");
  UploadedFiles.remove({});
});
