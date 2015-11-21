Template.noWranglerDocumentsHelp.helpers({
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
      status: "processing"
    }).count() > 0;
  },
  hasUploadingFile: function () {
    return WranglerFiles.find({
      "status": "uploading"
    }).count() > 0;
  },
});
