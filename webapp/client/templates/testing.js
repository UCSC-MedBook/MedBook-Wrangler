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
    sort: {
      gene_label: 1,
      sample_label: -1, // wrote my tests like this. sorry.
    },
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
  getExpression2: function () {
    var data = Expression2.find({}, Template.instance().options).fetch();

    console.log("data[data.length - 1]:", data[data.length - 1]);

    var transformed = [];
    data.forEach(function (expressionDoc) {
      var sampleLabels = Object.keys(expressionDoc.samples);
      sampleLabels.sort().reverse();
      for (var index in sampleLabels) {
        var sample_label = sampleLabels[index];
        transformed.push({
          gene_label: expressionDoc.gene,
          study_label: expressionDoc.Study_ID,
          collaborations: expressionDoc.Collaborations,
          sample_label: sample_label,
          values: {
            quantile_counts: expressionDoc.samples[sample_label].quantile_counts,
            quantile_counts_log: expressionDoc.samples[sample_label].rsem_quan_log2,
            raw_counts: expressionDoc.samples[sample_label].raw_counts,
            tpm: expressionDoc.samples[sample_label].tpm,
            fpkm: expressionDoc.samples[sample_label].fpkm,
          }
        });
      }
    });

    return transformed;
  },
  checkUndefined: function (text) {
    if (text === undefined) {
      return 'undefined';
    }
    return text;
  },
});

// Template.studyTesting

Template.studyTesting.onCreated(function () {
  var instance = this;

  instance.subscribe('studyTesting');
});

Template.studyTesting.helpers({
  getStudies: function () {
    return Studies.find({}, {
      sort: { id: 1 }
    });
  },
  getClinicalInfo: function () {
    return CRFs.find({
      CRF: "Clinical_Info",
    }, {
      sort: {
        Patient_ID: 1,
        Sample_ID: 1,
      }
    });
  },
  checkUndefined: function (text) {
    if (text === undefined) {
      return 'undefined';
    }
    return text;
  },
  sorted: function (thing) {
    thing.sort();
    return thing;
  },
});

// Template.isoformExpressionTesting

Template.isoformExpressionTesting.onCreated(function () {
  var instance = this;

  instance.options = {
    sort: {
      transcript_label: 1,
      sample_label: -1, // wrote my tests like this. sorry.
    },
    limit: 100,
  };
  instance.subscribe('isoformExpressionTesting', instance.options);
});

Template.isoformExpressionTesting.helpers({
  getIsoformExpression: function () {
    return IsoformExpression.find({}, Template.instance().options);
  },
  checkUndefined: function (text) {
    if (text === undefined) {
      return 'undefined';
    }
    return text;
  },
});
