Template.reviewObjectType.onCreated(function () {

  var instance = this;
  instance.submissionId = Template.parentData()._id;
  instance.collectionName = this.data.collectionName;

  // instance.loaded = new ReactiveVar(0);

  instance.autorun(function () {
    instance.subscribe('documentsForCollection',
        instance.submissionId, instance.collectionName,
        function () { // callback
          // console.log("I got the data for you");
        }
    );
  });
});

function fieldsFromProspectiveDocument(collectionName) {
  var schema = getSchemaFromName(collectionName);
  var fields = schema.fieldOrder;

  return [{
      key: "validation_errors",
      label: "Validation errors",
      //tmpl: Template.rowValidation,
  }].concat(_.map(fields, function (value, key) {
    return {
      key: "prospective_document",
      label: schema.label(value),
      fn: function(rowValue, outerObject) {
        return rowValue[value];
      },
    };
  }));
}

Template.reviewObjectType.helpers({
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
