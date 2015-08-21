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
    if (storeName !== UploadedFileStore.name) return; // workaround for known bug
    console.log("stored file callback");

    var submission = WranglerSubmissions.findOne({
      "files": {
        $elemMatch: {
          "file_id": fileObject._id
        }
      }
    });

    function setFileStatus(statusString) {
      WranglerSubmissions.update({
            "_id": submission._id,
            "files.file_id": fileObject._id,
          }, {
            $set: { "files.$.status": statusString }
          });
    }
    setFileStatus("processing");

    var fileName = fileObject.original.name;
    if (fileName.slice(-4) === ".sif") {
      console.log("we found a sif file (network_interactions definition):",
          fileName);

      lineByLineStream(fileObject, function (line) {
        var brokenTabs = line.split("\t");
        if (brokenTabs.length === 3) {
          console.log("adding interaction:", line);
          WranglerDocuments.insert({
            "submission_id": submission._id,
            "collection_name": "network_interactions",
            "prospective_document": {
              "source": brokenTabs[0],
              "target": brokenTabs[2],
              "interaction": brokenTabs[1],
            },
          });
        } else {
          console.log("don't know what to do:", line);
          setFileStatus("error");
        }
      });
    } else if (fileName.slice(-4) === ".tab" &&
        fileName.indexOf("definitions") >= 0) {
      console.log("we found a network_elements definition file:", fileName);

      lineByLineStream(fileObject, function(line){
        var brokenTabs = line.split("\t");
        if (brokenTabs.length === 2) {
          console.log("adding definition:", line);
          WranglerDocuments.insert({
            "submission_id": submission._id,
            "collection_name": "network_elements",
            "prospective_document": {
              "name": brokenTabs[1],
              "type": brokenTabs[0],
            },
          });
        } else {
          console.log("don't know what to do:", line);
          setFileStatus("error");
        }
      });
    } else {
      console.log("unknown file type");
      setFileStatus("error");
      return;
    }

    setFileStatus("done");
  },
  function (error) {
    // TODO: set status to error if there's an exception thrown for the file
    console.log("Error calling callback on .on('stored') for file:", error);
  }
));
