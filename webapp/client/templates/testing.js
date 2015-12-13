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

  instance.options = {
    sort: { gene_label: 1 },
    limit: 100,
  };
  instance.subscribe('geneExpressionTesting', instance.options);
});

Template.geneExpressionTesting.helpers({
  getGeneExpression: function () {
    return GeneExpression.find({}, Template.instance().options);
  },
  checkUndefined: function (text) {
    if (text === undefined) {
      return 'undefined';
    }
    return text;
  },
});

// Template.expression2Testing

Template.expression2Testing.onCreated(function () {
  var instance = this;

  instance.options = {
    sort: { gene: 1 },
    limit: 100,
  };
  instance.subscribe('expression2Testing', instance.options);
});

Template.expression2Testing.helpers({
  getGeneExpression: function () {
    return GeneExpression.find({}, Template.instance().options);
  },
  checkUndefined: function (text) {
    if (text === undefined) {
      return 'undefined';
    }
    return text;
  },
});
