Meteor.methods({
  parseFile: function () {
    console.log("ready to parse file in Meteor method");
    var userProfile = Meteor.users.findOne({ _id: Meteor.userId() }).profile;
    var theFile = UploadedFiles.findOne({
      _id: userProfile.uploadedDocument.fileId
    });
    console.log(theFile);
    console.log("url: " + theFile.url());



    // var fs = Npm.require("fs");
    // console.log("FSSSSSSSSSSSSSSSSSSSSSS");
    // var hello = fs.createReadStream(theFile.url());
  }
});
