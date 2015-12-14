Meteor.methods({
  removeTestingData: function () {
    var user = Meteor.users.findOne(ensureLoggedIn());

    if (user.profile.collaborations.indexOf('testing') >= 0) {
      console.log("removing gene expression testing data");

      GeneExpression.remove({
        collaborations: 'testing',
      });

      Expression2.remove({
        Collaborations: 'testing',
      });

      return "done";
    }

    throw new Meteor.Error("you can't do that!");
  },
});
