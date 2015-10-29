exports.command = function() {
  this
    .verify.elementPresent("#create-new-submission")
    // .setValue('input[name="Progression_Sample_ID"]', patientRecord.progressionSampleId)
    // .clearValue('input[name="Progression_Biopsy_Date"]')
    .click('#create-new-submission').pause(1000)
    .reviewMainLayout()
    .verify.urlContains("editSubmission")
    .verify.elementPresent(".well.insert-file-well")
    .verify.elementPresent(".upload-files-input") // left button

    // right button
    .verify.elementPresent('input[name="urlInput"]')
    .verify.elementPresent(".add-from-web-form")

  ; return this;
};
