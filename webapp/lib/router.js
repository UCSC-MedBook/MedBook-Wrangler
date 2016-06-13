Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'pageNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'spinner',
});

Router.map(function() {
  this.route('listSubmissions', {
    path: '/wrangler/',
    subscriptions: function () {
      return Meteor.subscribe("listSubmissions");
    },
  });

  this.route('editSubmission', {
    path: '/wrangler/editSubmission/:submission_id',
    waitOn: function () {
      return Meteor.subscribe("wranglerSubmission", this.params.submission_id);
    },
    data: function () {
      var submission = WranglerSubmissions.findOne(this.params.submission_id);
      if (!submission) {
        this.render("pageNotFound");
      }
      return submission;
    },
  });

  // testing routes
  this.route('removeTestingData', {
    path: '/wrangler/testing/removeTestingData'
  });

  this.route('geneExpressionTesting', {
    path: '/wrangler/testing/geneExpressionTesting'
  });

  this.route('expression2Testing', {
    path: '/wrangler/testing/expression2Testing'
  });

  this.route('isoformExpressionTesting', {
    path: '/wrangler/testing/isoformExpressionTesting'
  });

  this.route('studyTesting', {
    path: '/wrangler/testing/studyTesting'
  });

  this.route('contrastTesting', {
    path: '/wrangler/testing/contrastTesting'
  });

  this.route('geneAnnotationTesting', {
    path: '/wrangler/testing/geneAnnotationTesting'
  });

  this.route('signatureTesting', {
    path: '/wrangler/testing/signatureTesting'
  });
});
