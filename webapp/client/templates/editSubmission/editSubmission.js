Template.editSubmission.onCreated(function () {
  var instance = this;

  this.autorun(function () {
    instance.subscribe("documentCounts", instance.data._id);
  });
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
    return WranglerFiles.find({
      "status": "done",
      error_description: { $exists: false },
    }).count() > 0;
  },
  hasProcessingFile: function () {
    return WranglerFiles.find({
      "status": {$in: ["processing", "waiting"]}
    }).count() > 0;
  },
  hasUploadingFile: function () {
    return WranglerFiles.find({
      "status": {
        $in: ["creating", "uploading", "saving"]
      }
    }).count() > 0;
  },
});
