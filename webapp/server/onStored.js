BlobStore.on("stored", Meteor.bindEnvironment(
  function (storeName, fileObject) {
    // workaround for known bug
    if (storeName !== BlobStore.name) return;

    var submissionId = WranglerSubmissions.findOne({
      "files": {
        $elemMatch: {
          "file_id": fileObject._id
        }
      }
    })._id;

    function setFileStatus(statusString, errorDescription) {
      var modifier = { $set: { "files.$.status": statusString } };

      if (errorDescription !== undefined) {
        modifier.$set["files.$.error_description"] = errorDescription;
      }

      WranglerSubmissions.update({
        "_id": submissionId,
        "files.file_id": fileObject._id,
      }, modifier);
    }
    setFileStatus("processing");

    // TODO: will this make it faster to insert?
    var insertedCount = 0;
    var callbackCount = 0;
    function insertCallback(error, result) {
      if (error) {
        console.log("something went wrong adding to the database...");
        console.log(error);
      }
      callbackCount++;
      if (callbackCount === insertedCount) {
        setFileStatus("done");
        console.log("finished writing new data from file:", fileName);
      }
    }
    function documentInsert(collectionName, prospectiveDocument) {
      insertedCount++;
      WranglerDocuments.insert({
        "submission_id": submissionId,
        "collection_name": collectionName,
        "prospective_document": prospectiveDocument,
      }, insertCallback);
    }
    var onError = _.partial(setFileStatus, "error");

    function setToWriting() {
      // if there was no error, set status to writing
      if (WranglerSubmissions.findOne({
            "files.file_id": fileObject._id
          }, {
            // http://stackoverflow.com/a/12241930/1092640
            fields: { "files.$": 1 }
          }).files[0].status !== "error") {
        setFileStatus("writing");
      }
    }

    try {
      var fileName = fileObject.original.name;
      if (fileName.slice(-4) === ".sif") {
        parseNetworkInteractions(fileObject, documentInsert, onError);
      } else if (fileName.slice(-4) === ".tab" &&
          fileName.indexOf("definitions") > -1) {
        parseNetworkElements(fileObject, documentInsert, onError);
        setToWriting();
      } else if (fileName.slice(-4) === ".vcf") {
  		  parseMutationVCF(fileObject, documentInsert, onError);
        setToWriting();
  	  } else if (fileName.slice(-7) === ".tar.gz") {
        uncompressTarGz(fileObject, documentInsert, onError);
        debugger;
      } else {
        onError("unknown file type");
      }
    }
    catch (error) {
      onError("Internal server error: developers have been notified.");
      // TODO: notify developers
      console.log("SERVER ERROR: while calling callback on .on('stored')" +
          " for file:", error);
    }
  },
  function (error) {
    console.log("SERVER ERROR: while calling callback on .on('stored')" +
        " for file:", error);
    console.log("The error was really bad because it wasn't caught by the try");
  }
));
