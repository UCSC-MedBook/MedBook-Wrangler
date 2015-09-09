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
