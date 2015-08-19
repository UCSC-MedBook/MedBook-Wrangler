Template.registerHelper("print", function (object) {
  console.log(object);
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
