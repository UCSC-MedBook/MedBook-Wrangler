Meteor.methods({
  parseFile: function (fileId) {

    var currentUserId = Meteor.user() && Meteor.user()._id;
    if (!currentUserId) {
      throw new Meteor.Error(403, "not logged in");
    }

    console.log("ready to parse file in Meteor method");
    Meteor.users.update({ _id: currentUserId }, {
      $set: {
        "profile.uploadedDocument.fileId": fileId
      }
    });

    var theFile = UploadedFiles.findOne({ _id: fileId });
    console.log("theFile::");
    console.log(theFile);
    //debugger;

    var theStream = theFile.createReadStream()
      .on('open', function () {
        console.log("openned!!!");
      })
      .on('data', function () {
        console.log("data recieved");
      });

    // var theStream = theFile.createReadStream();
    // theStream.on('data', function (chunk) {
    //   console.log("got chunk!");
    // });

    // var ByLine = Meteor.npmRequire('byline');
    // var byLineStream = new ByLine(theFile.createReadStream());
    //var byLineStream = new ByLine(FS.TempStore.createReadStream(theFile));
    //
    // var newPathway = {
    //   "pathway_label": "No label provided",
    //   "elements": [],
    //   "interactions": [],
    // };
    // byLineStream.on('data', function (line) {
    //   console.log("line: " + line);
    //   var tabCount = line.split("\t").length - 1;
    // });

    console.log("done with meteor method");
  }
});
