module.exports = {
  tags: ["metadata", "travis"],
  "Upload only sample label mapping file": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(2000)
      .reviewMainLayout()
    ;

    // make sure user exists and log in
    client
      .createTestingUser()
      .signIn("testing@medbook.ucsc.edu", "testing")
    ;

    var urlInput = "form.add-from-web-form input[name='urlInput']";

    // add a sample mapping file, make sure we can't submit with just that
    client
      .click("#create-new-submission")
      .waitForElementVisible(urlInput, 5000)

      // add the label mapping file
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/BD2K_rna_mapping_test.tsv')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed, make sure file type couldn't be inferred
      .waitForElementVisible(".edit-wrangler-file select[name=file_type]", 35000)
      .verify.containsText("#submissionFiles div.alert.alert-warning > p",
          "File type could not be inferred. Please manually select a file type")
      .click("#submissionFiles select > option[value='BD2KSampleLabelMap']")
      .waitForElementVisible("#submissionFiles > div.panel.panel-info", 2000)
      .waitForElementVisible("#submissionFiles > div.panel.panel-success", 35000)

      .verify.containsText("#review-sample_label_map > table > tbody > tr > th", "DTB-998Dup")
      .verify.containsText("#review-sample_label_map > table > tbody > tr > td:nth-child(2)", "DTB-998-Baseline-Duplicate")
      .verify.containsText("#review-sample_label_map > table > tbody > tr > td:nth-child(3)", "123456789")
      .verify.containsText("#optionsAndSubmit > div > div:nth-child(1) .well", "You cannot submit a submission with only metadata.")

      // go back and delete the submission
      .click("#left > ol > li:nth-child(1) > a")
      .waitForElementVisible("#create-new-submission", 5000)
      .click("body > div > div.list-group > div:nth-child(2) .delete-submission")
      .verify.elementPresent("body") // so that the click happens
    ;
  }
};
