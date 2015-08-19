Template.uploadPathway.events({
  "click #add-files-button": function (event, instance) {
    $("#upload-files-input").click();
  },
  "change #upload-files-input": function (event, instance) {
    event.preventDefault();

    function insertCallback(error, fileObject) {
      console.log("insertCallback function");
      Meteor.call("addFileToSubmission", instance.data._id, fileObject._id,
          fileObject.original.name);
    }

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
      var pathwayFile = new FS.File(files[i]);
      pathwayFile.user_id = Meteor.userId();
      // This isn't in a Meteor method because insertion should happen on the
      // client according to the FS.File docs
      UploadedFiles.insert(pathwayFile, insertCallback);
    }
  },
  "click .remove-this-file": function(event, instance) {
    Meteor.call("removeFile", instance.data._id,
        this.file_id);
  },



  "submit #upload-pathway": function (event, instance) {
    event.preventDefault(); // prevent default browser form submit
    console.log("someone hit the submit button");
  },

});
