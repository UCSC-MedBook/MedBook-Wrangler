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

function fullInsertCallback (submissionId, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addFileToSubmission", submissionId, fileObject._id,
        fileObject.original.name);
  }
}

Template.editSubmission.events({
  // when they click the button to add a file
  "click #add-files-button": function (event, instance) {
    $("#upload-files-input").click();
  },
  // when they actually select a file
  "change #upload-files-input": function (event, instance) {
    event.preventDefault();

    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
      var newFile = new FS.File(files[i]);
      newFile.metadata = {
        "user_id": Meteor.userId(),
        "submission_id": instance.data._id,
      };

      console.log("newFile:", newFile);

      // insertion is supposed to happen on the client
      Blobs.insert(newFile,
          _.partial(fullInsertCallback, instance.data._id));
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
  // add a URL from tbe web
  "submit .add-from-web-form": function (event, instance) {
      event.preventDefault();

      var urlInput = event.target.urlInput;
      // https://github.com/CollectionFS/Meteor-CollectionFS/
      // wiki/Insert-One-File-From-a-Remote-URL
      var newFile = new FS.File();
      newFile.attachData(urlInput.value, function (error) {
        if (error) {
          console.log("error:", error);
          throw error;
        } else {
          newFile.metadata = {
            "user_id": Meteor.userId(),
            "submission_id": instance.data._id,
          };
          Blobs.insert(newFile,
              _.partial(fullInsertCallback, instance.data._id));
          urlInput.value = "";
        }
      });
    }
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
            // TODO: list the actual pathways that they can upload to
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
