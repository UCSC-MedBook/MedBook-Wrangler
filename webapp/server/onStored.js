BlobStore.on("stored", Meteor.bindEnvironment(
  function (storeName, fileObject) {
    if (storeName !== BlobStore.name) return; // workaround for known bug

    var fileName = fileObject.original.name;
    var insertedCount = 0;
    var callbackCount = 0;

    var helpers = {};
    helpers = {
      setFileStatus: function (statusString, errorDescription) {
        var modifier = { $set: { "files.$.status": statusString } };

        if (errorDescription !== undefined) {
          modifier.$set["files.$.error_description"] = errorDescription;
        }

        WranglerSubmissions.update({
          "_id": fileObject.metadata.submission_id,
          "files.file_id": fileObject._id,
        }, modifier);
      },
      insertCallback: function (error, result) {
        if (error) {
          console.log("something went wrong adding to the database...");
          console.log(error);
          helpers.onError("something went wrong adding to the database");
        }
        callbackCount++;
        if (callbackCount === insertedCount) {
          helpers.setFileStatus("done");
          console.log("finished writing new data from file:", fileName);
        }
      },
      documentInsert: function (collectionName, prospectiveDocument) {
        insertedCount++;
        WranglerDocuments.insert({
          "submission_id": fileObject.metadata.submission_id,
          "file_id": fileObject._id,
          "collection_name": collectionName,
          "prospective_document": prospectiveDocument,
        }, helpers.insertCallback);
      },
    };
    // has to be after because code runs immidiately
    helpers.onError = _.partial(helpers.setFileStatus, "error");

    helpers.setFileStatus("processing");

    function extensionEquals(extension) {
      return fileName.slice(-extension.length) === extension;
    }

    try {
      if (extensionEquals(".sif")) {
        parseNetworkInteractions(fileObject, helpers);
      } else if (extensionEquals(".tab") &&
          fileName.indexOf("definitions") > -1) {
        parseNetworkElements(fileObject, helpers);
      } else if (extensionEquals(".vcf")) {
  		  parseMutationVCF(fileObject, helpers);
  	  } else if (extensionEquals(".tar.gz")) {
        uncompressTarGz(fileObject, helpers);
      } else if (extensionEquals(".rsem.genes.raw_counts.tab")) {
        parseGeneExpression(fileObject, "raw_counts", helpers);
      } else if (extensionEquals(".rsem.genes.norm_counts.tab")) {
        parseGeneExpression(fileObject, "counts", helpers);
      } else if (extensionEquals(".rsem.genes.norm_tpm.tab")) {
        parseGeneExpression(fileObject, "tpm", helpers);
      } else if (extensionEquals(".rsem.genes.norm_fpkm.tab")) {
        parseGeneExpression(fileObject, "fpkm", helpers);
      } else {
        helpers.onError("unknown file type");
      }

      // TODO: if from a compressed file, delete the file on the disk
    }
    catch (error) {
      helpers
          .onError("Internal server error: developers have been notified.");
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
