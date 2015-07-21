Router.map(function() {
  // showPatient (/sample/:currentSampleLabel) ==> same thing
  this.route('chooseUpload', {
    path: '/',
  });
  this.route('uploadPathway', {
    path: 'uploadPathway',
    subscriptions: function () {
      return Meteor.subscribe("uploaded_files");
    },
  });
});
