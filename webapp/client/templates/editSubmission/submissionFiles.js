// Template.submissionFiles

Template.submissionFiles.helpers({
  getFiles: function () {
    return WranglerFiles.find({}, {sort: {blob_name: 1}});
  },
});

// Template.uploadNewFiles

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
    if (urlInput.value) {
      // https://github.com/CollectionFS/Meteor-CollectionFS/
      // wiki/Insert-One-File-From-a-Remote-URL
      var newFile = new FS.File();
      newFile.attachData(urlInput.value, function (error) {
        if (error) {

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
    }
  },
});

// Template.showFile

Template.showFile.onCreated(function () {
  var instance = this;

  // subscribe to the blob for this wrangler file
  instance.subscribe("specificBlob", instance.data.blob_id);

  // NOTE: instance.data does not seem to be reactive
  var needToStartJob = instance.data.status === "uploading";
  instance.autorun(function () {
    // NOTE: blob will be null at first
    var blob = Blobs.findOne(instance.data.blob_id);

    // update if it's stored
    if (needToStartJob && blob && blob.hasStored("blobs")) {
      Meteor.call("reparseWranglerFile", instance.data._id);
      needToStartJob = false;
    }
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
  "click .reparse-this-file": function(event, instance) {
    // wrapping it in Meteor.defer gets rid of a DOM error
    // https://github.com/meteor/meteor/issues/2981
    Meteor.defer(function () {
      Meteor.call("reparseWranglerFile", instance.data._id);
    });
  },
});

// Template.fileInformation

Template.fileInformation.onCreated(function () {
  var instance = this;
  instance.needSchemaCorrection = new ReactiveVar(false);
});

Template.fileInformation.helpers({
  needSchemaCorrection: function () {
    return Template.instance().needSchemaCorrection.get();
  },
  shouldShowDescription: function () {
    var errorDescription = this.error_description &&
        (this.status === "error" || this.status === "done");
    return errorDescription || Template.instance().needSchemaCorrection.get();
  },
  notShownLines: function () {
    if (!this.blob_line_count) {
      return true; // so that it shows "..." until it loads
    }

    var lineBreaks = this.blob_text_sample.match(/\n/g);
    if (!lineBreaks) {
      lineBreaks = [];
    }
    return this.blob_line_count - lineBreaks.length - 1;
  },
});

// Template.fileOptions

function getOptionsSchema () {
  var fileType = Wrangler.fileTypes[this.options.file_type];

  var fileTypeSchema;
  if (fileType) {
    fileTypeSchema = fileType.schema;
  }

  return new SimpleSchema([
    new SimpleSchema({
      file_type: WranglerFiles.simpleSchema()
          .schema()["options.file_type"]
    }),
    fileTypeSchema,
  ]);
}

function autoformId () {
  return "edit-wrangler-file-" + this._id;
}

function validateLater (instance) {
  Meteor.clearTimeout(instance.validateTimeout);

  instance.validateTimeout = Meteor.setTimeout(function () {
    if (AutoForm.validateForm(autoformId.call(instance.data))) {
      instance.parent().needSchemaCorrection.set(false);
      Meteor.call("reparseWranglerFile", instance.data._id);
    } else {
      instance.parent().needSchemaCorrection.set(true);
    }
  }, 200);
}

Template.fileOptions.onRendered(function () {
  var instance = this;
  var fileType = instance.$(
    ".edit-wrangler-file > div:nth-child(1) > div > select[name=file_type]");

  // set up a handler for when the select[name=file_type] changes
  fileType.change(function (event) {
    WranglerFiles.update(instance.data._id, {
      $set: {
        "options.file_type": event.target.value
      }
    });
    validateLater(instance);
  });

  // show schema errors when rendered for the first time
  validateLater(instance);
});

Template.fileOptions.helpers({
  autoformId: autoformId,
  optionsSchema: function () {
    return getOptionsSchema.call(this);
  },
  isInSchema: function (field) {
    var simpleSchema = getOptionsSchema.call(this);
    return simpleSchema.schema()[field];
  },
  WranglerFiles: WranglerFiles,
});

Template.fileOptions.events({
  "submit .edit-wrangler-file": function (event, instance) {
    event.preventDefault();

    var formId = autoformId.call(instance.data);
    var newOptions = AutoForm.getFormValues(formId, instance).insertDoc;

    WranglerFiles.update(instance.data._id, {
      $set: {
        options: newOptions
      }
    });

    validateLater(instance);
  }
});

// Template.contrastFields

Template.contrastFields.onCreated(function () {
  var instance = this;

  instance.subscribe("updatableContrasts");
});

Template.contrastFields.helpers({
  contrastOptions: function () {
    return Contrasts.find({
      user_id: Meteor.userId(),
    }).map(function (contrast) {
      return {
        label: contrast.contrast_label,
        value: contrast.contrast_label,
      };
    });
  },
});

// Template.collaborationLabelField

Template.collaborationLabelField.helpers({
  options: function () {
    return Collabs.find().map(function (collaboration) {
      return {
        label: collaboration.description,
        value: collaboration.name,
      };
    });
  },
});
