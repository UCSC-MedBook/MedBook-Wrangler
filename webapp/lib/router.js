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
    path: '/Wrangler/',
    subscriptions: function () {
      return Meteor.subscribe("listSubmissions");
    },
  });

  this.route('editSubmission', {
    path: '/Wrangler/editSubmission/:submission_id',
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
    path: '/Wrangler/testing/removeTestingData'
  });

  this.route('geneExpressionTesting', {
    path: '/Wrangler/testing/geneExpressionTesting'
  });
});
