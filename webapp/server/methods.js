Meteor.methods({
  removeTestingData: function () {
    var user = Meteor.users.findOne(makeSureLoggedIn());

    if (user.profile.collaborations.indexOf('testing')) {
      console.log("removing GeneExpression testing data");
      GeneExpression.remove({
        collaborations: ['testing'],
      });
    }
  },
});
