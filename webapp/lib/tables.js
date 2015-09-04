TabularTables = {};

if (Meteor.isClient) {
  Template.registerHelper('TabularTables', TabularTables);
}

var availableCollections = [
  "superpathways",
  "network_elements",
  "network_interactions",
  "mutations",
];

TabularTables.listSubmissions = new Tabular.Table({
  name: "Submissions list",
  collection: WranglerSubmissions,
  columns: [
    {
      data: "date_created",
      title: "Date created",
      render: function (val, type, doc) {
        return moment(val).fromNow();// TODO: make reactive
      },
    },
    { data: "status", title: "Status" },
    {
      title: "Files",
      tmpl: Meteor.isClient && Template.listFiles,
    },
    {
      title: "Actions",
      tmpl: Meteor.isClient && Template.submissionActions,
    },
  ],
  extraFields: ['collection_name'],
  changeSelctor: function (selector, userId) {
    console.log("selector:", selector);
    ensureSubmissionAvailable(selector.submission_id, userId);

    return selector;
  },
});

generateColumns = function (collectionName) {
  var schema = getSchemaFromName(collectionName);
  var fields = schema.fieldOrder;

  return [
    {
      title: "Errors",
      tmpl: Meteor.isClient && Template.rowValidation,
    }
  ].concat(_.map(fields, function (fieldName) {
    console.log("fieldName:", fieldName);
    return {
      title: schema.label(fieldName),
      data: "prospective_document." + fieldName,
    };
  }));
};

_.each(availableCollections, function (collectionName) {
  TabularTables[collectionName] = new Tabular.Table({
    name: collectionName,
    collection: WranglerDocuments,
    columns: generateColumns(collectionName),
    extraFields: ['collection_name'],
    changeSelctor: function (selector, userId) {
      console.log("selector:", selector);
      ensureSubmissionAvailable(selector.submission_id, userId);

      return selector;
    },
  });
});
