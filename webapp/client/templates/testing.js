// Template.removeTestingData

Template.removeTestingData.onCreated(function () {
  var instance = this;

  instance.status = new ReactiveVar('removing');
});

Template.removeTestingData.onRendered(function () {
  var instance = this;

  Meteor.call('removeTestingData', function (error, result) {
    if (error) {
      instance.status.set('error');
      console.log("error:", error);
    } else {
      instance.status.set('done');
    }
  });
});

Template.removeTestingData.helpers({
  status: function () {
    return Template.instance().status.get();
  },
});

// Template.geneExpressionTesting

Template.geneExpressionTesting.onCreated(function () {
  var instance = this;

  instance.subscribe('geneExpressionTesting', {
    sort: { gene_label: 1 },
    limit: 100,
  });
});

Template.geneExpressionTesting.helpers({
  stringify: JSON.stringify,
});
