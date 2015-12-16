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

      Studies.update({
        collaborations: "testing",
      }, {
        $set: {
          Sample_IDs: [],
          Patient_IDs: [],
        }
      });

      return "done";
    }

    throw new Meteor.Error("you can't do that!");
  },
});
