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

Template.registerHelper('count', function (first) {
  return first.count();
});

// for validating against a schema and listing invalid keys

function getValidationContext(data) {
  return getCollectionByName(data.document_type)
      .simpleSchema()
      .namedContext(data._id);
}

Template.registerHelper("isValid", function (){
  return getValidationContext(this).validate(this.contents);
});

Template.registerHelper("invalidKeys", function (){
  return getValidationContext(this).invalidKeys();
});

Template.registerHelper("classifySubmissionType", function (submission_id) {
  var documentTypes = getSubmissionTypes(submission_id);

  if (documentTypes.length === 1) {
    return documentTypes[0];
  }

  return null;
});
