BlobStore.on("stored", Meteor.bindEnvironment(
  function (storeName, fileObject) {
    if (storeName !== BlobStore.name) return; // workaround for known bug

    WranglerSubmissions.update({
          "_id": fileObject.metadata.submission_id,
          "files.file_id": fileObject._id,
        }, {
          $set: { "files.$.status": "processing" }
        });

    Jobs.insert({
      "name": "processWranglerFile",
      "date_created": new Date(),
      "args": {
        "file_id": fileObject._id,
      },
    });
  },
  function (error) {
    console.log("SERVER ERROR: while calling callback on .on('stored')" +
        " for file:", error);
    console.log("The error was really bad because it wasn't caught by the try");
  }
));
