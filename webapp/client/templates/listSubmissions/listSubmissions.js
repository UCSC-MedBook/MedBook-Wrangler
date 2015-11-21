Template.listSubmissions.helpers({
  submissions: function () {
    return WranglerSubmissions.find({}, {
      sort: { date_created: -1 }
    });
  },
});

Template.listSubmissions.events({
  "click #create-new-submission": function (event, instance){
    Meteor.call("createSubmission", function (error, result) {
      Router.go('editSubmission', { "submission_id": result });
    });
  }
});

// Template.submissionListItem

Template.submissionListItem.onCreated(function () {
  var instance = this;

  instance.subscribe('wranglerFiles', instance.data._id);
});

Template.submissionListItem.helpers({
  sinceCreated: function () {
    console.log("this:", this);
    return moment(this.date_created).fromNow();
  },
  wranglerFiles: function () {
    return WranglerFiles.find({
      submission_id: this._id
    }, {
      sort: { blob_name: 1 }
    });
  }
});

// Template.submissionActions

Template.submissionActions.helpers({
  editOrView: function () {
    if (this.status === 'editing') {
      return 'Edit';
    } else {
      return 'View';
    }
  },
});

Template.submissionActions.events({
  "click .delete-submission": function (event, instance) {
    Meteor.call("deleteSubmission", instance.data._id);
  },
});
