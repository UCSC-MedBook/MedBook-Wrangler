Meteor.methods({
  startFileUpload: function (information) {
    Meteor.users.update({ _id: Meteor.user()._id }, {
      $set: {
        "profile.uploadedDocument": information
      }
    });
  },
  setFileId: function (fileId) {
    // check if fileId is valid
    Meteor.users.update({ _id: Meteor.user()._id }, {
      $set: {
        "profile.uploadedDocument.fileId": fileId
      }
    });
  },
  
});
