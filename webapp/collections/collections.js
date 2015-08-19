// TODO: write a cron job to go through and delete old ones of these
WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  "user_id": { type: Meteor.ObjectID },
  "type": {
    type: String,
    allowedValues: [
      "pathway"
    ],
  },
  "files": {
    type: [
      new SimpleSchema({
        "file_id": { type: Meteor.ObjectID },
        "file_name": { type: String },
      })
    ],
    optional: true
  },
}));

UploadedFileStore = new FS.Store.GridFS("uploaded_files", {
  beforeWrite: function (fileObject) {
    // this.userId because we're on the server (doesn't work)
    fileObject.uploaded_date = new Date();
  }
});

UploadedFileStore.on("stored", function (storeName, fileObject) {
  if (storeName !== UploadedFileStore.name) return; // workaround for known bug

  // var byLine = Meteor.npmRequire('byline');
  //
  // var stream = byLine(fileObject.createReadStream("uploaded_files"))
  //   .on('data', function (line) {
  //     //console.log("line: " + line);
  //   });
  console.log("stored file");
});

UploadedFiles = new FS.Collection("uploaded_files", {
  stores: [UploadedFileStore],
});

// users can only modify their own documents
UploadedFiles.allow({
  insert: function (userId, doc) {
    console.log("UploadedFiles.allow insert");
    return userId === doc.user_id;
  },
  update: function(userId, doc, fields, modifier) {
    console.log("UploadedFiles.allow update:", fields, modifier);
    return userId === doc.user_id;
  },
  remove: function (userId, doc) {
    console.log("UploadedFiles.allow remove");
    return userId === doc.user_id;
  },
  download: function (userId, doc) {
    console.log("UploadedFiles.allow download");
    return userId === doc.user_id;
  }
});
