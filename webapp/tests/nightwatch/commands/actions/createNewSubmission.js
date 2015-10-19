exports.command = function() {
  this
    .verify.elementPresent("create-new-submission")
    // .setValue('input[name="Progression_Sample_ID"]', patientRecord.progressionSampleId)
    // .clearValue('input[name="Progression_Biopsy_Date"]')
    .click('#create-new-submission').pause(1000)
    .verify.urlContains("editSubmission")
    .verify.containsText("h2", "Add files");

  return this;
};
