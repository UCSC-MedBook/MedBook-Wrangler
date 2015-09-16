Template.reviewWranglerDocuments.helpers({
  // TODO: use getDocumentTypes instead
  hasSuperpathwayDocuments: function () {
    return Counts.get("superpathways") +
        Counts.get("superpathway_interactions") +
        Counts.get("superpathway_elements");
  },
  hasMutationDocuments: function () {
    return Counts.get("mutations");
  },
  hasGeneExpressionDocuments: function () {
    return Counts.get("gene_expression");
  },
});

Template.reviewSuperpathwayDocuments.helpers({
  elementsSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "superpathway_elements",
    };
  },
  interactionsSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "superpathway_interactions",
    };
  },
});

Template.reviewMutationDocuments.helpers({
  mutationsSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "mutations",
    };
  },
});

Template.reviewGeneExpressionDocuments.helpers({
  geneExpressionSelector: function () {
    return {
      "submission_id": this._id,
      "collection_name": "gene_expression",
    };
  },
});
