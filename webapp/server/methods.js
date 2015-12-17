Meteor.methods({
  removeTestingData: function () {
    var user = Meteor.users.findOne(ensureLoggedIn());

    if (user.profile.collaborations.indexOf('testing') >= 0) {
      console.log("removing testing data");

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

      CRFs.remove({
        CRF: "Clinical_Info",
        Study_ID: "prad_test",
      });

      return "done";
    }

    throw new Meteor.Error("you can't do that!");
  },
});
