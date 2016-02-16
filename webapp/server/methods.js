Meteor.methods({
  removeTestingData: function () {
    var user = MedBook.ensureUser(Meteor.userId());

    if (user.getCollaborations().indexOf("testing") >= 0) {
      console.log("removing testing data");

      GeneExpression.remove({
        collaborations: "testing",
      });

      Expression2.remove({
        Collaborations: "testing",
      });

      IsoformExpression.remove({
        collaborations: "testing",
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

      Contrasts.remove({
        collaborations: "testing",
      });

      Signatures.remove({
        collaborations: "testing",
      });

      return "done";
    }

    throw new Meteor.Error("you can't do that!");
  },
});
