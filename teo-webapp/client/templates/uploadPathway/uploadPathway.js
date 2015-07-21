Template.uploadPathway.events({
  "submit #upload-pathway": function (event) {
    event.preventDefault(); // prevent default browser form submit

    // upload all the files
    console.log("about to upload");
    var pathwayFile = event.target.pathwayFile.files[0];
    console.log(pathwayFile);

    Meteor.call("startFileUpload", {
      "fileName": pathwayFile.name,
      "fileSize": pathwayFile.size,
      "type": "pathway",
    });

    UploadedFiles.insert(pathwayFile, function(error, fileObject) {
      if (error) {
        console.log("There was an error!");
        console.log(error);
      } else {
        Meteor.call("parseFile", fileObject._id);
      }
    });

    console.log("done uploading");
  }
});
