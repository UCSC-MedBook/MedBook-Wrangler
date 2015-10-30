exports.command = function(submission) {
  this.verify.urlContains("editSubmission");

  // Files
  this
    .verify.elementPresent(".well.insert-file-well")
    .verify.elementPresent(".insert-file-button input[type=file]") // left button
    // right button
    .verify.elementPresent('.insert-file-button input[name="urlInput"]')
    .verify.elementPresent(".insert-file-button .add-from-web-form")
  ;

  // Options
  this
    .verify.elementPresent("#optionsAndSubmit textarea[name='description']")
    .verify.elementPresent("#optionsAndSubmit select[name='study_label']")
    .verify.elementPresent("#optionsAndSubmit select[name='collaboration_label']")
    .verify.elementPresent("#optionsAndSubmit button.reset-options")
    .verify.elementPresent("#optionsAndSubmit button.save-for-later")
    .verify.elementPresent("#optionsAndSubmit button.validate-and-submit")
  ;

  if (submission.status === "editing") {
    this
      .verify.elementPresent(".panel-heading", "Editing")
      .verify.elementPresent(".panel-body", "Click validate and submit to continue")
    ;
  }

  return this; // allows the command to be chained.
};
