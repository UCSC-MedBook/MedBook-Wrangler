Template.registerHelper('isDefined', function (first) {
  return first !== undefined;
});

Template.registerHelper('getSubmissionType', function () {
  var filtered = getSubmissionTypes(this._id)
    .filter(function (value) {
      return value !== undefined;
    });

  if (filtered.length === 1) {
    return filtered[0];
  }
});

// TODO: remove this?
Template.registerHelper("classifySubmissionType", function (submission_id) {
  var documentTypes = getSubmissionTypes(submission_id);

  if (documentTypes.length === 1) {
    return documentTypes[0];
  }

  return null;
});

Template.registerHelper("horizontalLabelClass", function () {
  return "col-md-3 col-sm-4 col-xs-6";
});

Template.registerHelper("horizontalInputColClass", function () {
  return "col-md-9 col-sm-8 col-xs-6";
});
