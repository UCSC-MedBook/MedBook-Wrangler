Template.editSubmission.helpers({
  hasDocuments: function () {
    return Counts.get("all-documents");
  },
  classifySubmissionType: function () {
    var documentTypes = getDocumentTypes(this._id);

    if (documentTypes.length === 1) {
      return documentTypes[0];
    }

    return null;
  },
  getDocumentTypes: getDocumentTypes,
});

function getValidationContext(data) {
  return getCollectionByName(data.collection_name)
      .simpleSchema()
      .namedContext(data._id);
}

Template.addFiles.rendered = function() {
  var self;
  this.autorun(function () {
    self = this;
  });

  $(document).on('click', function (e) {
    var parents = $(e.target).parents('.click-outside-to-unselect');
    if (parents.length === 0) {
      Meteor.call("unsetEditingFile", self.templateInstance().data._id);
    }
  });
};

// defined out here because it's used in two helpers
// (_.partial used within the functions)
function fullInsertCallback (submissionId, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addFile", submissionId, fileObject._id,
        fileObject.original.name);
  }
}

Template.addFiles.helpers({
  getFiles: function () {
    return WranglerFiles.find({});
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
});

Template.addFiles.events({
  "click .remove-this-file": function(event, instance) {
    console.log("remove-this-file");
    Meteor.call("removeFile", instance.data._id, this._id);
  },
  "click .edit-this-file": function (event, instance) {
    Meteor.call("setEditingFile", instance.data._id, this._id);
  },
});

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

  // adding new objects manually
  "click .add-superpathway": function () {
    Meteor.call("insertDocument", {
      "submission_id": Template.instance().data._id,
      "collection_name": "superpathways",
      "prospective_document": {},
    });
  },
});

AutoForm.addHooks('edit-file', {
  // Called when form does not have a `type` attribute
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    this.event.preventDefault();

    var submissionId = Template.instance().parentInstance().data._id;

    var newFileType = insertDoc.manual_file_type;
    if (newFileType) {
      Meteor.call("setManualFileType", submissionId, insertDoc.manual_file_type);
    } else {
      Meteor.call("unsetManualFileType", submissionId);
    }

    Meteor.call("unsetEditingFile", submissionId);

    this.done();
  },
});

Template.editFileType.helpers({
  fileTypeSchema: function () {
    return WranglerFiles.simpleSchema().pick("manual_file_type");
  },
  currentEditingFile: function () {
    return WranglerFiles.findOne(Template.instance().data.editing_file);
  },
});

Template.lastSubmissionErrors.helpers({
  hasErrors: function () {
    return this.errors && this.errors.length > 0;
  },
});
