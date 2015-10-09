Template.reviewWranglerDocuments.helpers({

});

Template.reviewSuperpathwayDocuments.helpers({
  elementsSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "superpathway_elements",
    };
  },
  interactionsSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "superpathway_interactions",
    };
  },
});

Template.reviewMutationDocuments.helpers({
  mutationsSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "prospective_document",
      "collection_name": "mutations",
    };
  },
});

Template.reviewGeneExpression.onCreated(function () {
  var instance = this;

  instance.subscribe("addSubmissionDocuments", instance.data._id);
});

Template.reviewGeneExpression.helpers({
  sampleNormalization: function () {
    return WranglerDocuments.find({
      document_type: "sample_normalization"
    }, {
      sort: [["contents.sample_label", "asc"]]
    });
  },
});

Template.reviewRectangularGeneExpressionDocuments.helpers({
  sampleLabelSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "sample_label",
    };
  },
  geneLabelSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "gene_label",
    };
  },
});
