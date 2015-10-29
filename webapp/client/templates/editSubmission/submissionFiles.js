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

  instance.autorun(function () {
    // subscribe to the blob for this wrangler file
    instance.subscribe("specificBlob", instance.data.blob_id, function () {
      // switch from uploading to processing when blob has stored
      instance.autorun(function () {
        var blob = Blobs.findOne(instance.data.blob_id);

        // update if it's stored
        if (instance.data.status === "uploading" &&
            blob && blob.hasStored("blobs")) {
          // should follow two-phase commit pattern but in untrusted code
          var updated = WranglerFiles.update(instance.data._id, {
            $set: {
              status: "processing",
            }
          });
        }
      });
    });
  });
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
      case "uploading":
        return "panel-warning";
      case "processing":
        return "panel-info";
      case "error":
        return "panel-danger";
    }
    console.log("Error: file contextual class not found");
  },
});

Template.showFile.events({
  "click .remove-this-file": function(event, instance) {
    // wrapping it in Meteor.defer gets rid of a DOM error
    // https://github.com/meteor/meteor/issues/2981
    Meteor.defer(function () {
      Meteor.call("removeWranglerFile", instance.data._id);
    });
  },
});

//
// Template fileInformation
//

function getOptionsSchema () {
  return new SimpleSchema([
    new SimpleSchema({
      file_type: WranglerFiles.simpleSchema()
          ._schema["options.file_type"]
    }),
    WranglerFileTypeSchemas[this.options.file_type],
  ]);
}

Template.fileInformation.helpers({
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
  notShownLines: function () {
    var lineBreaks;
    if (this.blob_text_sample) {
      lineBreaks = this.blob_text_sample.match(/\n/g);
    }
    if (!lineBreaks) {
      lineBreaks = [];
    }
    return this.blob_line_count - lineBreaks.length;
  },
  optionsSchema: function () {
    return getOptionsSchema.call(this);
  },
  isInSchema: function (field) {
    var simpleSchema = getOptionsSchema.call(this);
    return simpleSchema._schema[field];
  },
});

Template.fileInformation.events({
  "submit .edit-wrangler-file": function (event, instance) {
    event.preventDefault();

    var formId = "edit-wrangler-file-" + instance.data._id;

    var oldOptions = instance.data.options;
    var newOptions = AutoForm.getFormValues(formId, instance).insertDoc;
    console.log("oldOptions:", oldOptions);
    console.log("newOptions:", newOptions);

    // if file_type has changed, reparse the file
    if (oldOptions.file_type !== newOptions.file_type) {
      var modifier = {};
      if (newOptions.file_type) {
        console.log("set");
        modifier.$set = { "options.file_type": newOptions.file_type };
      } else {
        console.log("UNSET");
        modifier.$unset = { "options.file_type": true };
      }

      WranglerFiles.update(instance.data._id, modifier);

      console.log("about to call reparseWranglerFile");
      Meteor.call("reparseWranglerFile", instance.data._id);
    }

    // give the autoform some time to update itself (in case file_type changed)
    Meteor.defer(function () {
      if (AutoForm.validateForm(formId)) {
        var setObject = {};
        for (var index in newOptions) {
          if (index !== "file_type") { // file_type handled above
            setObject["options." + index] = newOptions[index];
          }
        }
        if (Object.keys(setObject) > 0) {
          WranglerFiles.update(instance.data._id, { $set: setObject });
        }
      } else {
        console.log("form not okay");
      }
    });
  }
});
