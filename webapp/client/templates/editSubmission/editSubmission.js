Template.editSubmission.onCreated(function () {

  var instance = this;

  instance.autorun(function () {
    instance.subscribe('documentsForSubmission', instance.data._id,
        function () { // callback
          // console.log("I got the data for you");
        }
    );
  });
});

Template.editSubmission.events({
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
    Router.go("listSubmissions");
  },
});

Template.editSubmission.helpers({
  hasDocuments: function () {
    return WranglerDocuments.find({}).count() > 0;
  },
  reviewObjects: function () {
    return [
      { title: "Mutation data", collectionName: "mutations" },
    ];
  },
});

var superpathwayReviewObjects = [
  { title: "Network elements", collectionName: "network_elements" },
  { title: "Network interactions", collectionName: "network_interactions" },
];

Template.reviewSuperpathwayData.helpers({
  hasDocuments: function () {
    return WranglerDocuments.find({
      collection_name: {
        $in: ["network_elements", "network_interactions"]
      }
    }).count() > 0;
  },
  reviewObjects: function () {
    return superpathwayReviewObjects;
  },
  superpathwaySchema: function () {
    return new SimpleSchema({
      "superpathway_id": {
        type: String,
        autoform: {
          type: "select2",
          options: function () {
            return [
              {label: "2013 label", value: "2013"},
              {label: "2014 label", value: "2014"},
              {label: "2015 label", value: "2015"}
            ];
          }
        },
      },
    });
  },
});

Template.reviewSuperpathwayData.events({
  "submit #superpathway-schema": function (event, instance){
    event.preventDefault();
    var formValues = AutoForm.getFormValues("superpathway-schema");

    Meteor.call("updateAllDocuments",
        instance.data._id,
        _.pluck(superpathwayReviewObjects, "collectionName"),
        formValues.updateDoc.$set);
  }
});
