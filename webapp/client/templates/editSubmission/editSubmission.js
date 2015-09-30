Template.editSubmission.onCreated(function () {
  var instance = this;

  instance.subscribe("documentCounts", instance.data._id);
});

Template.editSubmission.helpers({
  hasDocuments: function () {
    return Counts.get("all-documents") > 0;
  },
  classifySubmissionType: function () {
    var documentTypes = getSubmissionTypes(this._id);

    if (documentTypes.length === 1) {
      return documentTypes[0];
    }

    return null;
  },
  getSubmissionTypes: getSubmissionTypes,
  subscriptionsReallyReady: function () {
    return Counts.has("all-documents");
  },
  hasFiles: function () {
    return WranglerFiles.find().count() > 0;
  },
  hasCompletedFile: function () {
    return WranglerFiles.find({ "status": "done" }).count() > 0;
  },
  hasProcessingFile: function () {
    return WranglerFiles.find({ "status": "processing" }).count() > 0;
  },
  hasUploadingFile: function () {
    return WranglerFiles.find({
      "status": {
        $in: ["creating", "uploading", "saving"]
      }
    }).count() > 0;
  },
});

function getValidationContext(data) {
  return getCollectionByName(data.document_type)
      .simpleSchema()
      .namedContext(data._id);
}

Template.addFiles.rendered = function() {
  this.autorun(function (first, second) {
    var data = this.templateInstance().data;

    if (data.status === "editing") {
      $(document).on('click', function (e) {
        var parents = $(e.target).parents('.click-outside-to-unselect');
        if (parents.length === 0) {
          WranglerSubmissions.update(data._id, {
            $unset: { "editing_file": 1 }
          });
        }
      });
    } else {
      $(document).off('click');
    }
  });
};

Template.addFiles.helpers({
  shouldBeFullWidth: function () {
    return this.status !== "editing" || WranglerFiles.find().count() === 0;
  },
  statusOfEditingFile: function () {
    var editingFile = WranglerFiles.findOne(this.editing_file);

    if (editingFile) {
      return editingFile.status;
    } else {
      console.log("there is no currently selected editing file");
    }
  },
});

Template.listFiles.helpers({
  getFiles: function () {
    return WranglerFiles.find({}, {sort: {blob_name: 1}});
  },
  fileContextualClass: function () {
    switch (this.status) {
      case "done":
        return "list-group-item-success";
      case "creating": case "uploading": case "saving":
        return "list-group-item-warning";
      case "processing":
        return "list-group-item-info";
      case "error":
        return "list-group-item-danger";
    }
    console.log("Error: file contextual class not found");
  },
  activeClass: function () {
    // TODO: fix this
    var data = Template.instance().data;
    if (data.editing_file !== undefined && data.editing_file === this._id) {
      return "active";
    }
  },
  isEditable: function () {
    return Template.instance().data.status === "editing";
  },
});

Template.listFiles.events({
  "click .remove-this-file": function(event, instance) {
    if (instance.data.status === "editing") {
      Meteor.call("removeWranglerFile", instance.data._id, this._id);
    }
  },
  "click .edit-this-file": function (event, instance) {
    if (instance.data.status === "editing") {
      WranglerSubmissions.update(instance.data._id, {
        $set: { "editing_file": this._id }
      });
    }
  },
});

// defined out here because it's used in two helpers
// (_.partial used within the functions)
function blobsInsertCallback (submissionId, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addWranglerFile", submissionId, fileObject._id,
        fileObject.original.name);
  }
}

Template.uploadFilesListItem.events({
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

Template.editFileOptions.helpers({
  fileTypeSchema: wranglerFileOptions,
  currentEditingFile: function () {
    return WranglerFiles.findOne(Template.instance().data.editing_file).options;
  },
  stillProcessing: function () {
    var editingFile = WranglerFiles.findOne(this.editing_file);
    return (editingFile.status !== "done" && editingFile.status !== "error");
  },
});

Template.editFileOptions.events({
  "click .set-file-options": function (event, instance) {
    event.preventDefault();
    var data = instance.parentInstance().data;
    if (AutoForm.validateForm("edit-file")) {
      var insertDoc = AutoForm.getFormValues("edit-file").insertDoc;
      var oldOptions = WranglerFiles.findOne(data.editing_file).options;

      if (JSON.stringify(insertDoc) !== JSON.stringify(oldOptions)) {
        Meteor.call("reparseWranglerFile", data.editing_file, insertDoc);
      }

      // hide that dialog
      WranglerSubmissions.update(data._id, {
        $unset: { "editing_file": 1 }
      });
    }
  },
});
