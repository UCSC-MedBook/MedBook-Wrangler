//
// Template submissionFiles
//

Template.submissionFiles.helpers({
  getFiles: function () {
    return WranglerFiles.find({}, {sort: {blob_name: 1}});
  },
});

//
// Template uploadNewFiles
//

// defined out here because it's used in two helpers
// (_.partial used within the functions)
function blobsInsertCallback (submission_id, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addWranglerFile", submission_id, fileObject._id,
        fileObject.original.name);
  }
}

Template.uploadNewFiles.events({
  // adding new files

  // when they actually select a file
  "change #upload-files-input": function (event, instance) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
      var newFile = new FS.File(files[i]);
      newFile.metadata = {
        "user_id": Meteor.userId(),
        "submission_id": instance.data._id,
        "uploaded": true,
      };

      // insertion is supposed to happen on the client
      Blobs.insert(newFile,
          _.partial(blobsInsertCallback, instance.data._id));
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
          "uploaded": true,
        };
        Blobs.insert(newFile,
            _.partial(blobsInsertCallback, instance.data._id));
        urlInput.value = "";
      }
    });
  },
});

//
// Template showFile
//

Template.showFile.onCreated(function () {
  var instance = this;

  // subscribe to blobs and make it change to "waiting" when stored
  instance.autorun(function () {
    // subscribe to the blob for this wrangler file
    instance.subscribe("specificBlob", instance.data.blob_id, function () {
      // switch from uploading to waiting when blob has stored
      instance.autorun(function () {
        var blob = Blobs.findOne(instance.data.blob_id);
        if (instance.data.status === "uploading" &&
            blob && blob.hasStored("blobs")) {
          // update it if it's stored
          WranglerFiles.update(instance.data._id, {
            $set: {
              status: "waiting",
            }
          });
        }
      });
    });
  });

  AutoForm.addHooks('edit-wrangler-file-' + instance.data._id, {
    // called whenever the form changes
    onSuccess: function(formType, result) {
      console.log("formType:", formType);
      console.log("result:", result);
      if (formType === "update" && result === 1) {
        Meteor.call("reparseWranglerFile", instance.data._id);
      }
    },
  }, true);
});


Template.showFile.helpers({
  panelClass: function () {
    switch (this.status) {
      case "done":
        if (this.error_description) {
          return "panel-warning";
        } else {
          return "panel-success";
        }
        break;
      case "creating": case "uploading":
        return "panel-warning";
      case "processing": case "saving": case "waiting":
        return "panel-info";
      case "error":
        return "panel-danger";
    }
    console.log("Error: file contextual class not found");
  },
  showUploadBar: function () {
    return this.status === "creating" || this.status === "uploading";
  },
  fileTypeSchema: function () {
    return WranglerFiles.simpleSchema();
  },
  fileTypeIsGeneExpression: function () {
    var fieldValue = AutoForm.getFieldValue("file_type", "edit-file");
    return fieldValue === "BD2KGeneExpression";
  },
  isEditable: function () {
    return Template.instance().parent().data.status === "editing";
  },



  // TODO: DO I NEED THIS
  shouldShowDescription: function () {
    return this.error_description &&
        (this.status === "error" || this.status === "done");
  },
  WranglerFiles: function () {
    return WranglerFiles;
  },
  autoformId: function () {
    return "edit-wrangler-file-" + this._id;
  },
});

Template.showFile.events({
  // NOTE: keeping just in case
  // "click .reparse-this-file": function (event, instance) {
  //   Meteor.call("reparseWranglerFile", this._id);
  // },
  "click .remove-this-file": function(event, instance) {
    var wrangler_file_id = this._id;

    // wrapping it in Meteor.defer gets rid of a DOM error
    // https://github.com/meteor/meteor/issues/2981
    Meteor.defer(function () {
      Meteor.call("removeWranglerFile",
          instance.parent().data._id, wrangler_file_id);
    });
  },
});




// NOTE: for setting options for a wrangler file
// Template.editFileOptions.events({
//   "click .set-file-options": function (event, instance) {
//     event.preventDefault();
//     var parentInstance = instance.parentInstance();
//     if (AutoForm.validateForm("edit-file")) {
//       var editingFileId = parentInstance.editingFileId.get();
//       var insertDoc = AutoForm.getFormValues("edit-file").insertDoc;
//       var oldOptions = WranglerFiles.findOne(editingFileId).options;
//
//       if (JSON.stringify(insertDoc) !== JSON.stringify(oldOptions)) {
//         Meteor.call("reparseWranglerFile", editingFileId, insertDoc);
//       }
//
//       // hide that dialog
//       parentInstance.editingFileId.set(null);
//     }
//   },
// });
