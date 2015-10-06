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
  extraFields: ['document_type'],
  changeSelector: function (selector, user_id) {
    return {
      "user_id": user_id,
    };
  },
});

function ensureAvailableForSelector (selector, user_id) {
  ensureSubmissionAvailable(user_id, selector.submission_id);
  return selector;
}

TabularTables.sample_labels = new Tabular.Table({
  name: "sample_labels",
  collection: WranglerDocuments,
  columns: [
    { title: "Sample labels", data: "contents.sample_label" }
  ],
  extraFields: ['document_type', 'wrangler_file_id'],
  changeSelector: ensureAvailableForSelector,
});

TabularTables.gene_labels = new Tabular.Table({
  name: "gene_labels",
  collection: WranglerDocuments,
  columns: [
    { title: "Gene labels", data: "contents.gene_label" }
  ],
  extraFields: ['document_type', 'wrangler_file_id'],
  changeSelector: ensureAvailableForSelector,
});

generateColumns = function (collectionName) {
  var schema = getCollectionByName(collectionName).simpleSchema();
  var fields = schema.fieldOrder;

  return [
    // {
    //   title: "Errors",
    //   tmpl: Meteor.isClient && Template.rowValidation,
    // }
  ].concat(_.map(fields, function (fieldName) {
    return {
      title: schema.label(fieldName),
      data: "contents." + fieldName,
    };
  }));
};

_.each(availableCollections, function (collectionName) {
  TabularTables[collectionName] = new Tabular.Table({
    name: collectionName,
    collection: WranglerDocuments,
    columns: generateColumns(collectionName),
    extraFields: ['document_type', 'wrangler_file_id'],
    changeSelector: ensureAvailableForSelector,
  });
});
