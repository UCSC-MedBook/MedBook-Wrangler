Template.reviewWranglerDocuments.helpers({
  // TODO: use getSubmissionTypes instead
  superpathwayType: function () {
    return Counts.get("type_superpathway");
  },
  mutationType: function () {
    return Counts.get("type_mutation");
  },
  geneExpressionType: function () {
    return Counts.get("type_gene_expression");
  },
  rectangularGeneExpressionType: function () {
    return Counts.get("type_gene_expression");
  },
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
      "document_type": "mutations",
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
