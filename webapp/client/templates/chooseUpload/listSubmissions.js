Template.listSubmissions.helpers({
  mySubmissions: function () {
    // for reactiveTable
    return WranglerSubmissions;
  },
  hasCreatedSubmission: function () {
    return WranglerSubmissions.find({}).count() > 0;
  },
  tableSettings: function () {
      return {
        rowsPerPage: 10,
        showNavigation: 'always',
        // showColumnToggles: true,
        // TODO: pull from labels in schema (?)
        fields: [
          {
            key: 'date_created',
            label: 'Created date',
            fn: function (value) {
              return moment(value).fromNow();// TODO: make reactive
            },
            sortByValue: true,
            sortDirection: 'descending'
          },
          {
            key: 'status',
            label: 'Status',
          },
          {
            key: 'files',
            label: 'Files',
            tmpl: Template.listFiles,
            sortable: false,
          },
          {
            key: 'actions',
            label: 'Actions',
            tmpl: Template.submissionActions,
            sortable: false,
          },
        ]
      };
    }
});

Template.submissionActions.events({
  "click .delete-submission": function (event, instance) {
    Meteor.call("deleteSubmission", instance.data._id);
  },
  "click .cancel-validation": function (event, instance) {
    console.log("This doesn't do anything...");
  },
});
