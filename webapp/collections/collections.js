// TODO: write a cron job to go through and delete unused ones (also files)
// TODO: should we make them name their submissions?
WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  "user_id": { type: Meteor.ObjectID },
  "created_at": { type: Date },
  "files": {
    type: [
      new SimpleSchema({
        "file_id": { type: Meteor.ObjectID },
        "file_name": { type: String },
        "status": {
          type: String,
          allowedValues: [
            "creating",
            "uploading",
            "processing",
            "writing",
            "done",
            "error",
          ],
        },
        // TODO: only allow if status = "error"
        "error_description": { type: String, optional: true },
      })
    ],
    optional: true
  },
  "status": {
    type: String,
    allowedValues: [
      "creating",
      "editing",
      "validating",
      "writing",
      "done",
    ],
  }
}));

WranglerDocuments = new Meteor.Collection("wrangler_documents");
WranglerDocuments.attachSchema(new SimpleSchema({
  "submission_id": { type: Meteor.ObjectID },
  // TODO: link up remove button so it removes these documents
  // "file_id": { type: Meteor.ObjectID }, // which file it's from
  "collection_name": { // not so enthused about this
    type: String,
    allowedValues: [
      "network_elements",
      "network_interactions",
      "mutations",
    ],
  },
  "prospective_document": { type: Object, blackbox: true },
}));

UploadedFileStore = new FS.Store.GridFS("uploaded_files", {
  beforeWrite: function (fileObject) {
    // this.userId because we're on the server (doesn't work)
    fileObject.uploaded_date = new Date();
  }
});

UploadedFiles = new FS.Collection("uploaded_files", {
  stores: [UploadedFileStore],
});

// users can only modify their own documents
UploadedFiles.allow({
  insert: function (userId, doc) {
    return userId === doc.user_id;
  },
  update: function(userId, doc, fields, modifier) {
    return userId === doc.user_id;
  },
  remove: function (userId, doc) {
    return userId === doc.user_id;
  },
  download: function (userId, doc) {
    return userId === doc.user_id;
  }
});

WranglerDocuments.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, doc, fields, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
});
