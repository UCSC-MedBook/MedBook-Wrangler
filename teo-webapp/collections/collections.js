var uploadedFileStore = new FS.Store.FileSystem("uploaded_files");

UploadedFiles = new FS.Collection("uploaded_files", {
  stores: [uploadedFileStore]
});

// allow/deny rules for this collection
UploadedFiles.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, docs, fields, modifier){
      // return adminUser(userId) || _.all(docs, function(doc) {
      //     return doc.owner === userId;
      // });
      return true;
  },
  remove: function (userId, docs){
      // return adminUser(userId) || _.all(docs, function(doc) {
      //     return doc.owner === userId;
      // });
      return true;
  },
  download: function (userId, doc) {
    return true;
  }
});
