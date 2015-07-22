Meteor.methods({

  parseFile: function (fileId) {

    var currentUserId = Meteor.call("assertLoggedIn");

    console.log("fileId: " + fileId);

    var theFile = UploadedFiles.findOne({_id: fileId});
    // ensure they're the owner of the file

    console.log(theFile);

    // this will crash
    theFile.createReadStream("uploaded_files")
      .on('data', function () {
        console.log("data!");
      });

    // this is the place where I want to read text inside theFile

    console.log("done with meteor method");
  }
});
