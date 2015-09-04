Router.configure({
  // // we use the  appBody template to define the layout for the entire app
  // layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'pageNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'spinner',
});

Router.map(function() {
  // showPatient (/sample/:currentSampleLabel) ==> same thing
  this.route('listSubmissions', {
    path: '/Wrangler/',
    subscriptions: function () {
      return Meteor.subscribe("listSubmissions");
    },
    data: function () {
      return "Hello!";
    },
  });

  this.route('editSubmission', {
    path: '/Wrangler/editSubmission/:wranglerSubmissionId',
    waitOn: function () {
      return Meteor.subscribe("wranglerSubmission", this.params.wranglerSubmissionId);
    },
    onBeforeAction: function () {
      var submissionId = this.params.wranglerSubmissionId;

      // make sure submission belongs to them

      if (submissionId === "create") {
        // create one if we need to
        Meteor.call("createSubmission", function (error, result) {
          // TODO: catch error
          Router.go('editSubmission',
              { "wranglerSubmissionId": result },
              { replaceState: true }); // back button will work
        });
        this.render("spinner");
      } else {
        this.next();
      }
    },
    data: function () {
      return WranglerSubmissions.findOne(this.params.wranglerSubmissionId);
    },
  });

});
