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

// for validating against a schema and listing invalid keys

function getValidationContext(data) {
  return getCollectionByName(data.document_type)
      .simpleSchema()
      .namedContext(data._id);
}

Template.registerHelper("isValid", function (){
  return getValidationContext(this).validate(this.prospective_document);
});

Template.registerHelper("invalidKeys", function (){
  return getValidationContext(this).invalidKeys();
});

/**
 * Get the parent template instance
 * http://stackoverflow.com/a/27962713/1092640
 * @param {Number} [levels] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.parentInstance = function (levels) {
  var view = Blaze.currentView;
  if (typeof levels === "undefined") {
    levels = 1;
  }
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !(levels--)) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};
