Template.geneExpressionReview.helpers({
  reviewPanels: function () {
    return [
      {
        name: 'ignored_genes',
        title: 'Invalid genes',
        description: 'The following genes were found to be invalid and will be ignored.',
        css_class: 'panel-warning',
        columns: [
          { heading: 'Gene', attribute: 'gene' },
        ],
      },
      {
        name: 'mapped_genes',
        title: 'Mapped genes',
        description: 'These genes are valid but are going to be mapped ' +
            'into MedBook gene namespace.',
        css_class: 'panel-default',
        columns: [
          { heading: 'Gene in file', attribute: 'gene_in_file' },
          { heading: 'MedBook gene name', attribute: 'mapped_gene' },
        ],
      },
      {
        name: 'sample_normalization',
        title: 'Gene counts',
        css_class: 'panel-default',
        columns: [
          {
            heading: 'Sample label',
            attribute: 'sample_label',
            header_of_row: true
          },
          { heading: 'Normalization', attribute: 'normalization_description' },
          { heading: 'Genes defined', attribute: 'gene_count' },
        ],
      }
    ];
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
    return instance.loaded.get() === 0 || // haven't loaded any data
        (instance.loaded.get() !== 0 && instance.rowCursor().count !== 0);
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
