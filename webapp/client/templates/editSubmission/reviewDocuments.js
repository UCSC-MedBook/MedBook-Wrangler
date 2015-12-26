// Template.reviewWranglerDocuments

Template.reviewWranglerDocuments.helpers({
  getPanels: function () {
    var submission_type = getSubmissionTypes(this._id)[0];
    return Wrangler.reviewPanels[submission_type];
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
  instance.limit = new ReactiveVar(3);

  var sort = {};
  sort['contents.' + instance.data.columns[0].attribute] = 1;
  function getOptions () {
    return {
      sort: sort,
      limit: instance.limit.get(),
    };
  }

  var submission_id = instance.parent(2).data._id;
  var document_type = instance.data.name;
  // instance.subscribe("wranglerDocumentCounts", submission_id, document_type);

  instance.autorun(function () {
    var options = getOptions();

    // subscribe to the posts publication
    instance.subscribe('wranglerDocuments',
        submission_id, document_type,
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
  },
  documentCount: function () {
    return Counts.get(Template.instance().data.name);
  },
  downloadQuery: function () {
    return "submission_type=" + getSubmissionTypes(this._id)[0] +
        "&document_type=" + Template.instance().data.name;
  },
  submission_id: function () {
    return Template.instance().parent(3).data._id;
  },
  existsAndBig: function () {
    return Counts.has(this.name) &&
        Counts.get(this.name) > Template.instance().loaded.get();
  },
});

Template.reviewPanel.events({
  'click .loadMore': function (event, instance) {
    instance.limit.set(instance.limit.get() + 3);
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
