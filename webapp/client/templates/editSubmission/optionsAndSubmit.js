var sharedSchema = new SimpleSchema({
  "description": { type: String },
  "study_label": { type: String },
  "collaboration_label": { type: String },
});

Template.optionsAndSubmit.helpers({
  classifySubmissionType: function () {
    var documentTypes = getSubmissionTypes(this._id);

    if (documentTypes.length === 1) {
      return documentTypes[0];
    }

    return null;
  },
  superpathwaySchema: function () {
    return new SimpleSchema([
      sharedSchema,
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
  mutationSchema: function () {
    return new SimpleSchema([
      sharedSchema,
      Mutations.simpleSchema().pick([
        "biological_source",
        "mutation_impact_assessor",
      ]),
    ]);
  },
  expressionSchema: function () {
    return new SimpleSchema([
      sharedSchema,
      GeneExpression.simpleSchema().pick([
        "study_label",
      ]),
    ]);
  },
});

var maxErrorsToDisplay = 5;
Template.submissionStatus.helpers({
  hasErrors: function () {
    return this.errors && this.errors.length > 0;
  },
  firstCoupleErrors: function () {
    return this.errors.slice(0, maxErrorsToDisplay);
  },
  tooManyErrors: function () {
    return this.errors.length > maxErrorsToDisplay;
  },
});

Template.submissionOptions.helpers({
  currentOptions: function () {
    return Template.instance().parent().data.options;
  },
  readonlyIfNotEditing: function () {
    if (Template.instance().parent().data.status !== "editing") {
      return "readonly";
    }
  },
});

function getUpdateOrCreate() {
  return AutoForm.getFieldValue("update_or_create", "submission-options");
}

Template.superpathwayFields.helpers({
  updateCreateSelected: function () {
    return getUpdateOrCreate() !== undefined;
  },
  selectOrText: function () {
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
});

Template.sharedFields.helpers({
  studyOptions: function () {
    return Studies.find().map(function (study) {
      return {
        label: study.name,
        value: study.id,
      };
    });
  },
  collaborationOptions: function () {
    return Collaborations.find().map(function (collaboration) {
      return {
        label: collaboration.description,
        value: collaboration.name,
      };
    });
  },
});

Template.validateAndSubmit.events({
  "click .save-for-later": function (event, instance) {
    event.preventDefault();
    WranglerSubmissions.update(instance.parent().parent().data._id, {
      $set: {
        "options": AutoForm.getFormValues("submission-options").insertDoc
      }
    });
  },
  "click .reset-options": function (event, instance) {
    event.preventDefault();
    WranglerSubmissions.update(instance.parent().parent().data._id, {
      $set: {
        "options": {}
      }
    });
    AutoForm.resetForm("submission-options");
  },
  "click .validate-and-submit": function (event, instance) {
    event.preventDefault();
    if (AutoForm.validateForm("submission-options")) {
      var submission_id = instance.parent().parent().data._id;
      WranglerSubmissions.update(submission_id, {
        $set: {
          "options": AutoForm.getFormValues("submission-options").insertDoc
        }
      });

      Meteor.call("submitSubmission", submission_id);
    }
  },
});
