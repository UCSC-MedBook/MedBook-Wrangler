// Template.geneExpressionReview

Template.geneExpressionReview.onCreated(function () {
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

Template.geneExpressionReview.helpers({
  reviewPanels: function () {
    return [
      {
        name: "ignored_genes",
        title: "Invalid genes",
        description: "The following genes were found to be invalid and will be ignored.",
        css_class: "panel-warning",
        columns: [
          { heading: "Gene", attribute: "gene" },
        ],
      },
      {
        name: "mapped_genes",
        title: "Mapped genes",
        description: "These genes are valid but are going to be mapped " +
            "into MedBook gene namespace.",
        css_class: "panel-default",
        columns: [
          { heading: "Gene in file", attribute: "gene_in_file" },
          { heading: "MedBook gene name", attribute: "mapped_gene" },
        ],
      },
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
          { heading: "Genes defined", attribute: "gene_count" },
        ],
      },
      {
        name: "gene_expression_data_exists",
        title: "Data already exists",
        description: "The following samples already have gene expression " +
            "data in MedBook. It's possible you don't have access to their " +
            "data because you are not in the correct collaborations.",
        css_class: "panel-danger",
        columns: [
          { heading: "File name", attribute: "file_name" },
          { heading: "Sample", attribute: "sample_label" },
          { heading: "Normalization", attribute: "normalization" },
        ],
      },
    ];
  },
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
    var subscription = instance.subscribe('wranglerDocuments',
        instance.parent().data._id, instance.data.name,
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
