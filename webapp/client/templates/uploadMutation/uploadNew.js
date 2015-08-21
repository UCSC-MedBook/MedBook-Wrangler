Template.uploadNew.events({
  "click #add-files-button": function (event, instance) {
    $("#upload-files-input").click();
  },
  "change #upload-files-input": function (event, instance) {
    event.preventDefault();

    function insertCallback(error, fileObject) {
      console.log("insertCallback function");
      Meteor.call("addFileToSubmission", instance.data._id, fileObject._id,
          fileObject.original.name);
      console.log(WranglerSubmissions.findOne(instance.data._id).files[0]);
    }

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
      var newFile = new FS.File(files[i]);
      newFile.user_id = Meteor.userId();
      // This isn't in a Meteor method because insertion should happen on the
      // client according to the FS.File docs
      UploadedFiles.insert(newFile, insertCallback);
    }
  },
  "click .remove-this-file": function(event, instance) {
    Meteor.call("removeFile", instance.data._id,
        this.file_id);
  },



  "submit #finalize-submission": function (event, instance) {
    event.preventDefault(); // prevent default browser form submit
    console.log("someone hit the submit button");
  },

});

function getSchemaFromName(collectionName) {
  switch (collectionName) {
    case "network_elements":
      return NetworkElements.simpleSchema();
    case "network_interactions":
      return NetworkInteractions.simpleSchema();
    default:
      console.log("couldn't find appropriate schema");
      return false;
  }
}

var counter = 0;

Template.uploadNew.helpers({
  dynamicSchema: function () {
    return getSchemaFromName(this.collection_name);
  },
  makeUniqueID: function () {
    counter++;
    console.log("counter:", counter);
    return "document-quickform-" + counter;
  },
});
