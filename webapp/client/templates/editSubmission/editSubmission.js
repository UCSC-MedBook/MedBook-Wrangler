Template.submissionFileList.events({
  // click the remove button for a specific file
  "click .remove-this-file": function(event, instance) {
    Meteor.call("removeFileFromSubmission", instance.data._id,
        this.file_id);
  },
});

// defined out here because it's used in two helpers
// (_.partial used within the functions)
function fullInsertCallback (submissionId, error, fileObject) {
  if (error) {
    console.log("error:", error);
  } else {
    Meteor.call("addFileToSubmission", submissionId, fileObject._id,
        fileObject.original.name);
  }
}

Template.fileUploader.events({
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
  },
});

Template.reviewWranglerDocuments.helpers({
  submissionHasReviewType: function (typeName) {
    return this.document_types && _.contains(this.document_types, typeName);
  },
});

AutoForm.addHooks('superpathway-options', {
  // Called when form does not have a `type` attribute
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    // console.log("onSubmit hook:", insertDoc);
    this.event.preventDefault();

    var submissionId = Template.instance().parentInstance().data._id;
    Meteor.call("setSuperpathway", submissionId, insertDoc.name);

    this.done();
  },
});

Template.reviewSuperpathwayDocuments.onCreated(function () {
  var template = this;

  template.subscribe("superpathways");
});

function getUpdateOrCreate() {
  return AutoForm.getFieldValue("update_or_create", "superpathway-options");
}

Template.reviewSuperpathwayDocuments.helpers({
  superpathwaySchema: function () {
    return new SimpleSchema([
      {
        "update_or_create": {
          type: String,
          label: "Update or create",
          allowedValues: ["update", "create"],
        },
      },
      Superpathways.simpleSchema().pick(['name']),
    ]);
  },
  updateCreateSelected: function () {
    return getUpdateOrCreate() !== undefined;
  },
  nameType: function () {
    if (getUpdateOrCreate() === "update") {
      return "select";
    } else {
      return "text";
    }
  },
  superpathwayOptions: function () {
    var sortedNames = _.pluck(Superpathways.find({}).fetch(), "name").sort();

    var uniqueNames = [];
    _.each(sortedNames, function (value, index) {
      if (index === 0 || sortedNames[index - 1] !== value) {
        uniqueNames.push(value);
      }
    });

    return _.map(uniqueNames, function (value) {
      return {
        "label": value,
        "value": value,
      };
    });
  },
  superpathwaySelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "superpathways",
    };
  },
  elementsSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "superpathway_elements",
    };
  },
  interactionsSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "superpathway_interactions",
    };
  },
});

AutoForm.addHooks('mutation-options', {
  // Called when form does not have a `type` attribute
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    // console.log("onSubmit hook:", insertDoc);
    this.event.preventDefault();

    var submissionId = Template.instance().parentInstance().data._id;
    Meteor.call("setMutationDocuments", submissionId, insertDoc);

    this.done();
  },
});

Template.reviewMutationDocuments.helpers({
  mutationSchema: function () {
    return Mutations.simpleSchema().pick([
      "biological_source",
      "mutation_impact_assessor",
    ]);
  },
});

Template.submitSubmission.events({
  // click the submit button at the end
  "click #submit-all-data": function (event, instance) {
    event.preventDefault(); // prevent default browser form submit
    console.log("someone hit the submit button");
    Meteor.call("submitSubmission", instance.data._id);
    Router.go("listSubmissions");
  },
});

function getValidationContext(data) {
  return getCollectionByName(data.collection_name)
      .simpleSchema()
      .namedContext(data._id);
}

Template.rowValidation.helpers({
  isValid: function () {
    var data = Template.instance().data;
    return getValidationContext(data).validate(data.prospective_document);
  },
  invalidKeys: function () {
    return getValidationContext(Template.instance().data).invalidKeys();
  },
});
