TabularTables = {};

if (Meteor.isClient) {
  Template.registerHelper('TabularTables', TabularTables);
}

var availableCollections = [
  "superpathways",
  "superpathway_elements",
  "superpathway_interactions",
  "mutations",
  "gene_expression",
];

TabularTables.listSubmissions = new Tabular.Table({
  name: "Submissions list",
  collection: WranglerSubmissions,
  order: [[0, "desc"]],
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
      title: "Actions",
      tmpl: Meteor.isClient && Template.submissionActions,
    },
  ],
  extraFields: ['collection_name'],
  changeSelctor: function (selector, userId) {
    console.log("selector:", selector);
    ensureSubmissionEditable(selector.submission_id, userId);

    return selector;
  },
});

generateColumns = function (collectionName) {
  var schema = getCollectionByName(collectionName).simpleSchema();
  var fields = schema.fieldOrder;

  return [
    {
      title: "Errors",
      tmpl: Meteor.isClient && Template.rowValidation,
    }
  ].concat(_.map(fields, function (fieldName) {
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
    extraFields: ['collection_name', 'wrangler_file_id'],
    changeSelctor: function (selector, userId) {
      console.log("selector:", selector);
      ensureSubmissionEditable(selector.submission_id, userId);

      return selector;
    },
  });
});
