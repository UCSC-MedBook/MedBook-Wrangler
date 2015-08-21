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

function fieldsFromProspectiveDocument(collectionName) {
  var schema = getSchemaFromName(collectionName);
  var fields = schema.fieldOrder;

  return _.map(fields, function (value, key) {
    return {
      key: "prospective_document",
      label: schema.label(value),
      fn: function(rowValue, outerObject) {
        return rowValue[value];
      },
    };
  });
}



var counter = 0;
Template.uploadNew.helpers({
  hasWranglerDocuments: function () {
    return WranglerDocuments.find().count() > 0;
  },
  reviewObjects: function () {
    return [
      { title: "Network elements", collectionName: "network_elements" },
      { title: "Network interactions", collectionName: "network_interactions" },
    ];
  },
  otherDocuments: function () {
    return []; // TODO
  },
  dynamicSchema: function () {
    return getSchemaFromName(this.collection_name);
  },
  makeUniqueID: function () {
    counter++;
    console.log("counter:", counter);
    return "document-quickform-" + counter;
  },
});

Template.reviewNewData.helpers({
  dynamicSettings: function () {
    return {
      collection: WranglerDocuments.find({
        "submission_id": Template.parentData()._id,
        "collection_name": this.collectionName,
      }),
      rowsPerPage: 10,
      showFilter: false,
      fields: fieldsFromProspectiveDocument(this.collectionName),
    };
  },
});
