var ignoredGenesPanel = {
  name: "ignored_genes",
  title: "Invalid genes",
  description: "The following genes were found to be invalid and will be ignored.",
  css_class: "panel-warning",
  columns: [
    { heading: "Gene", attribute: "gene" },
  ],
};

var mappedGenesPanel = {
  name: "mapped_genes",
  title: "Mapped genes",
  description: "These genes are valid but are going to be mapped " +
      "into MedBook gene namespace.",
  css_class: "panel-default",
  columns: [
    { heading: "Gene in file", attribute: "gene_in_file" },
    { heading: "MedBook gene name", attribute: "mapped_gene" },
  ],
};

var newSampleForStudy = {
  name: "new_sample_for_study",
  title: "New sample label",
  description: "The selected study currently has no record of the "+
      "following samples. They will be added to the study's list of " +
      "sample labels.",
  columns: [
    // TODO
    { heading: "Sample", attribute: "sample_label", header_of_row: true },
    { heading: "Normalization", attribute: "normalization" },
    { heading: "File name", attribute: "file_name" },
  ],
};

var expressionDataExists = {
  name: "expression_data_exists",
  title: "Data already exists",
  description: "The following samples already have expression " +
      "data in MedBook. It's possible you don't have access to their " +
      "data because you are not in the correct collaborations.",
  css_class: "panel-danger",
  columns: [
    { heading: "Sample", attribute: "sample_label", header_of_row: true },
    { heading: "Normalization", attribute: "normalization" },
    { heading: "File name", attribute: "file_name" },
  ],
};

var sampleLabelMap = {
  name: "sample_label_map",
  title: "Sample label mapping",
  description: "The following sample labels will be mapped from " +
      "UUIDs to sample labels.",
  css_class: "panel-default",
  columns: [
    {
      heading: "MedBook sample label",
      attribute: "sample_label",
      header_of_row: true
    },
    { heading: "Original sample label", attribute: "original_sample_label" },
    { heading: "Sample UUID", attribute: "sample_uuid" },
  ],
};

// Template.reviewWranglerDocuments

Template.reviewWranglerDocuments.helpers({
  geneExpressionPanels: function () {
    return [
      {
        name: "sample_normalization",
        title: "Gene counts",
        css_class: "panel-default",
        columns: [
          {
            heading: "Sample label",
            attribute: "sample_label",
            header_of_row: true
          },
          { heading: "Normalization", attribute: "normalization_description" },
          { heading: "Genes defined", attribute: "line_count" },
        ],
      },
      newSampleForStudy,
      expressionDataExists,
      sampleLabelMap,
      ignoredGenesPanel,
      mappedGenesPanel,
    ];
  },
  isoformExpressionPanels: function () {
    return [
      {
        name: "sample_normalization",
        title: "Isoform counts",
        css_class: "panel-default",
        columns: [
          {
            heading: "Sample label",
            attribute: "sample_label",
            header_of_row: true
          },
          { heading: "Normalization", attribute: "normalization_description" },
          { heading: "Isoforms defined", attribute: "line_count" },
        ],
      },
      newSampleForStudy,
      expressionDataExists,
      sampleLabelMap,
      {
        name: "ignored_transcript",
        title: "Ignored transcripts",
        css_class: "panel-default",
        columns: [
          { heading: "Transcript", attribute: "transcript_id" },
          { heading: "Gene name", attribute: "gene_label" },
          { heading: "Gene known?", attribute: "gene_known" },
        ],
      },
      {
        name: "transcript_version_mismatch",
        title: "Transcript version mismatch",
        css_class: "panel-default",
        columns: [
          { heading: "Transcript label", attribute: "transcript_label" },
          { heading: "Original (in file)", attribute: "version_in_file" },
          { heading: "MedBook version", attribute: "transcript_version" },
        ]
      },
      mappedGenesPanel,
    ];
  },
  networkPanels: function () {
    return [
      {
        name: "new_network",
        title: "New networks",
        description: "I need to write a description",
        css_class: "panel-default",
        columns: [
          { heading: "Network name", attribute: "name", header_of_row: true },
          { heading: "Version", attribute: "version" },
          { heading: "File name", attribute: "file_name" },
        ],
      },
      {
        name: "source_level_interactions",
        title: "Gene interactions",
        description: "I need to write a description",
        css_class: "panel-default",
        columns: [
          { heading: "Source gene", attribute: "source_label", header_of_row: true },
          { heading: "Target count", attribute: "target_count" },
          { heading: "Minimum weight", attribute: "min_weight" },
          { heading: "Maximum weight", attribute: "max_weight" },
          { heading: "Average weight", attribute: "mean_weight" },
          { heading: "Network name", attribute: "network_name" },
          { heading: "Network version", attribute: "network_version" },
        ],
      },
      ignoredGenesPanel,
      mappedGenesPanel,
    ];
  },
  metadataPanels: function () {
    return [
      sampleLabelMap,
    ];
  },
});

// Template.showReviewPanels

Template.showReviewPanels.onCreated(function () {
  var instance = this;

  // Keep track of which panels are shown so that if none are shown, we can
  // still say something. This is important because sometimes the client will
  // know that the submission type is gene_expression but nothing will show
  // up because no wrangler documents have been added yet.
  instance.shownPanels = new ReactiveVar({});

  instance.setPanelStatus = function (name, status) {
    var lastPanels = instance.shownPanels.get();
    lastPanels[name] = status;
    instance.shownPanels.set(lastPanels);
  };
});

Template.showReviewPanels.helpers({
  noPanelsShown: function () {
    // NOTE: to test this, remove all of the panel definitions in the
    // reviewPanels helper. This will simulate none of the panels being
    // shown. If you want to really be sure, add a panel with a fake name
    // so that it actually does a subscribe before disappearing (because of
    // lack of wrangler documents) and showing this panel instead.
    var shownPanels = Template.instance().shownPanels.get();

    // if all of them are false (none are shown), return true
    return ! _.some(Object.keys(shownPanels), function (value, key) {
      return shownPanels[value];
    });
  },
});

// Template.reviewPanel

Template.reviewPanel.onCreated(function () {
  var instance = this;

  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(5);

  var sort = {};
  sort['contents.' + instance.data.columns[0].attribute] = 1;
  function getOptions () {
    return {
      sort: sort,
      limit: instance.limit.get(),
    };
  }

  instance.autorun(function () {
    var options = getOptions();

    // subscribe to the posts publication
    instance.subscribe('wranglerDocuments',
        instance.parent(2).data._id, instance.data.name,
        options, function () {
      instance.loaded.set(options.limit);
    });
  });

  instance.rowCursor = function() {
    return WranglerDocuments.find({
      document_type: instance.data.name
    }, getOptions());
  };
});

Template.reviewPanel.helpers({
  shouldShowPanel: function () {
    var instance = Template.instance();
    showIt = instance.loaded.get() === 0 || // haven't loaded any data
        (instance.loaded.get() !== 0 && instance.rowCursor().count() !== 0);

    // put in nonreactive to avoid infinite loop
    var self = this;
    Tracker.nonreactive(function () {
      instance.parent().setPanelStatus(self.name, showIt);
    });

    return showIt;
  },
  getWranglerDocuments: function () {
    return Template.instance().rowCursor();
  },
  hasMoreRows: function () {
    return Template.instance().rowCursor().count() >= Template.instance().limit.get();
  }
});

Template.reviewPanel.events({
  'click .loadMore': function (event, instance) {
    instance.limit.set(instance.limit.get() + 5);
  }
});

// Template.panelRow

Template.panelRow.helpers({
  panelColumns: function() {
    return Template.instance().parent().data.columns;
  },
  cellData: function () {
    return Template.instance().data[this.attribute];
  },
});
