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
      // TODO: why isn't this handled by aldeed:tabular
      return Meteor.subscribe("listSubmissions");
    },
  });

  this.route('editSubmission', {
    path: '/Wrangler/editSubmission/:submissionId',
    waitOn: function () {
      return Meteor.subscribe("wranglerSubmission",
          this.params.submissionId);
    },
    data: function () {
      return WranglerSubmissions.findOne(this.params.submissionId);
    },
  });

});
