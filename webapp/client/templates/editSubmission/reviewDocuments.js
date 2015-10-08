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

Template.reviewGeneExpressionDocuments.helpers({
  geneExpressionSelector: function () {
    return {
      "submission_id": this._id,
      "document_type": "gene_expression",
    };
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
