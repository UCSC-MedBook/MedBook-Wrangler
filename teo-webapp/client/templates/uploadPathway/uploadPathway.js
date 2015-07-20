Template.uploadPathway.events({
  "submit #upload-pathway": function (event) {
    // Prevent default browser form submit
    event.preventDefault();

    // upload all the files
    console.log("about to upload");
    var pathwayFile = event.target.nameOfInput.files[0];
    console.log(pathwayFile);

    // should this be in a Meteor method?
    // can't they update this anyways on their own?
    // deny them permission to set this themselves in allow()?
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
        Meteor.call("setFileId", fileObject._id);
        Meteor.call("parseFile");
      }
    });

    console.log("done uploading");
  }
});
