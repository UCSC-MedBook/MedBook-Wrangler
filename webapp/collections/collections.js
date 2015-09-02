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
            "uncompressing",
            "processing",
            "saving",
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
  "file_id": { type: Meteor.ObjectID },
  "collection_name": { // not so enthused about this
    type: String,
    allowedValues: [
      "network_elements",
      "network_interactions",
      "mutations",
      "gene_expression",
    ],
  },
  "prospective_document": { type: Object, blackbox: true },
}));

BlobStore = new FS.Store.GridFS("blobs", {
  beforeWrite: function (fileObject) {
    if (fileObject.metadata === undefined) {
      fileObject.metadata = {};
    }
    fileObject.metadata.uploaded_date = new Date();
  }
});

Blobs = new FS.Collection("blobs", {
  stores: [BlobStore],
});

// users can only modify their own documents
Blobs.allow({
  insert: function (userId, doc) {
    return userId === doc.metadata.user_id;
  },
  update: function(userId, doc, fields, modifier) {
    return userId === doc.metadata.user_id;
  },
  remove: function (userId, doc) {
    return userId === doc.metadata.user_id;
  },
  download: function (userId, doc) {
    return userId === doc.metadata.user_id;
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
