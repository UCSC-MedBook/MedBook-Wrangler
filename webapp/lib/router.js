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
  this.route('chooseUpload', {
    path: '/Wrangler/',
  });

  this.route('uploadNew', {
    path: '/Wrangler/uploadNew/:wranglerSubmissionId',
    waitOn: function () {
      return Meteor.subscribe("wranglerSubmission", this.params.wranglerSubmissionId);
    },
    onBeforeAction: function () {
      var submissionId = this.params.wranglerSubmissionId;

      // make sure submission belongs to them

      if (submissionId === "create") {
        // create one if we need to
        Meteor.call("createSubmission", function (error, result) {
          console.log("result:", result);

          Router.go('uploadNew',
              { "wranglerSubmissionId": result },
              { replaceState: true });
        });
        this.render("loading");
      } else {
        this.next();
      }
    },
    data: function () {
      return WranglerSubmissions.findOne(this.params.wranglerSubmissionId);
    },
  });

});
