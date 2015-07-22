UploadedFileStore = new FS.Store.GridFS("uploaded_files", {
  beforeWrite: function (fileObject) {
    // this.userId because we're on the server (doesn't work)
    fileObject.owner = this.userId;
  }
});

UploadedFiles = new FS.Collection("uploaded_files", {
  stores: [UploadedFileStore],
});

// allow/deny rules for this collection
UploadedFiles.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, docs, fields, modifier){
      return true;
  },
  remove: function (userId, docs){
      return true;
  },
  download: function (userId, doc) {
    return true;
  }
});
