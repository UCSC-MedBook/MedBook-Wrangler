Template.submissionFileList.events({
  // click the remove button for a specific file
  "click .remove-this-file": function(event, instance) {
    Meteor.call("removeFileFromSubmission", instance.data._id,
        this.file_id);
  },
});

// defined out here because it's used in two helpers
// (_.partial used within the functions)
function fullInsertCallback (submissionId, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addFileToSubmission", submissionId, fileObject._id,
        fileObject.original.name);
  }
}

Template.fileUploader.events({
  // when they click the button to add a file
  "click #add-files-button": function (event, instance) {
    $("#upload-files-input").click();
  },
  // when they actually select a file
  "change #upload-files-input": function (event, instance) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
      var newFile = new FS.File(files[i]);
      newFile.metadata = {
        "user_id": Meteor.userId(),
        "submission_id": instance.data._id,
      };

      // insertion is supposed to happen on the client
      Blobs.insert(newFile,
          _.partial(fullInsertCallback, instance.data._id));
    }
  },
  // add a URL from tbe web
  "submit .add-from-web-form": function (event, instance) {
    event.preventDefault();

    var urlInput = event.target.urlInput;
    // https://github.com/CollectionFS/Meteor-CollectionFS/
    // wiki/Insert-One-File-From-a-Remote-URL
    var newFile = new FS.File();
    newFile.attachData(urlInput.value, function (error) {
      if (error) {
        console.log("error:", error);
        throw error;
      } else {
        newFile.metadata = {
          "user_id": Meteor.userId(),
          "submission_id": instance.data._id,
        };
        Blobs.insert(newFile,
            _.partial(fullInsertCallback, instance.data._id));
        urlInput.value = "";
      }
    });
  },
});

Template.listErrorsAndSubmit.helpers({
  hasErrors: function () {
    return this.errors && this.errors.length > 0;
  },
});

Template.listErrorsAndSubmit.events({
  // click the submit button at the end
  "click #submit-submission": function (event, instance) {
    event.preventDefault(); // prevent default browser form submit
    Meteor.call("submitSubmission", instance.data._id);
  },
});
