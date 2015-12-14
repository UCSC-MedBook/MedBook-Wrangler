Template.registerHelper("print", function (first, second, third, fourth) {
  if (first === undefined || second === undefined) {
    console.log("No arguments given to global print helper :(");
  } else if (third === undefined) {
    console.log(first);
  } else if (fourth === undefined) {
    console.log(first, second);
  } else {
    console.log("the current print helper only does 2 arguments...");
  }
});

Template.registerHelper('compare', function (first, second) {
  if (typeof first === 'object' && typeof second === 'object') {
    return _.isEqual(first, second); // do a object comparison
  } else {
    return first === second;
  }
});

Template.registerHelper('isDefined', function (first) {
  return first !== undefined;
});

Template.registerHelper('length', function (first) {
  if (first.count) {
    return first.count();
  }

  if (first.length !== undefined) {
    return first.length;
  }

  console.log("length cannot be calculated for", first);
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
