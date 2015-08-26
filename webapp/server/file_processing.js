// makes it easy to read a file line by line:
// calls callWithLine with each successive line of the file
function lineByLineStream(fileObject, callWithLine) {
  var byLine = Meteor.npmRequire('byline');
  var stream = byLine(fileObject.createReadStream("uploaded_files"))
    .on('data', Meteor.bindEnvironment(function (lineObject) {
      var line = lineObject.toString();
      callWithLine(line);
    }));
}

UploadedFileStore.on("stored", Meteor.bindEnvironment(
  function (storeName, fileObject) {
    // workaround for known bug
    if (storeName !== UploadedFileStore.name) return;

    // console.log("stored file callback");

    var submissionId = WranglerSubmissions.findOne({
      "files": {
        $elemMatch: {
          "file_id": fileObject._id
        }
      }
    })._id;

    function setFileStatus(statusString) {
      WranglerSubmissions.update({
            "_id": submissionId,
            "files.file_id": fileObject._id,
          }, {
            $set: { "files.$.status": statusString }
          });
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
    function onError() {
      // TODO: do this
      console.log("onError called");
    }

    var fileName = fileObject.original.name;
    if (fileName.slice(-4) === ".sif") {
      console.log("found a .sif file (network_interactions)");
      parseNetworkInteractions(fileObject, documentInsert);
    } else if (fileName.slice(-4) === ".tab" &&
        fileName.indexOf("definitions") >= 0) {
      console.log("found a .tab file (network_elements)");
      parseNetworkElements(fileObject, documentInsert);
    } else if (fileName.slice(-4) === ".vcf") {
		  // console.log("found a .vcf file (mutations)");
		  parseMutationVCF(fileObject, documentInsert);
	  } else {
      console.log("unknown file type");
      setFileStatus("error");
      return;
    }

    // TODO: check if not error before (currently just returning after each...)
    // console.log("finished processing file:", fileName);
    setFileStatus("writing");
  },
  function (error) {
    // TODO: set status to error if there's an exception thrown for the file
    console.log("Error calling callback on .on('stored') for file:", error);
  }
));
