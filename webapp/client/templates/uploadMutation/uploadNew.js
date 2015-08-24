Template.uploadNew.events({
  // when they click the button to add a file
  "click #add-files-button": function (event, instance) {
    $("#upload-files-input").click();
  },
  // when they actually select a file
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
  // click the remove button for a specific file
  "click .remove-this-file": function(event, instance) {
    Meteor.call("removeFile", instance.data._id,
        this.file_id);
  },
  // click the submit button at the end
  "click #submit-all-data": function (event, instance) {
    event.preventDefault(); // prevent default browser form submit
    console.log("someone hit the submit button");
    Meteor.call("submitData", instance.data._id);
    Router.go("chooseUpload");
  },

});

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
  hasDocuments: function () {
    return WranglerDocuments.find({
      "submission_id": this._id,
    }).count() > 0;
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
  hasDocumentsForMe: function () {
    return WranglerDocuments.find({
      "submission_id": Template.instance().submissionId,
      "collection_name": Template.instance().collectionName,
    }).count() > 0;
  },
});

Template.reviewNewData.onCreated(function () {

  var instance = this;
  instance.submissionId = Template.parentData()._id;
  instance.collectionName = this.data.collectionName;

  // instance.loaded = new ReactiveVar(0);

  instance.autorun(function () {
    instance.subscribe('wranglerDocuments',
        instance.submissionId, instance.collectionName,
        function () { // callback
          // console.log("I got the data for you");
        }
    );
  });
});
