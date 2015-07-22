Template.uploadPathway.events({
  "submit #upload-pathway": function (event, template) {

    console.log("someone hit the submit button");

    event.preventDefault(); // prevent default browser form submit

    var pathwayFile = event.target.pathwayFile.files[0];

    Meteor.call("setUploadedFile", {
      "fileName": pathwayFile.name,
      "fileSize": pathwayFile.size,
      "type": "pathway",
    });

    UploadedFiles.insert(new FS.File(pathwayFile), function (error, fileObj) {
      console.log("done uploading the file");
      Meteor.call("parseFile", fileObj._id, function () {
        console.log("done parsing file");
      });
    });
  }
});
