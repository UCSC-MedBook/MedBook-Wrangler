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
  getDocumentType: function () {
    return getDocumentTypes(this._id)[0];
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
