module.exports = {
  tags: ["contrast", "travis"],
  "Upload some contrast files": function (client) {
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

    // remove testing data
    // check to see that testing data has "No data" in '#data'
    client
      .url("http://localhost:3000/Wrangler/testing/removeTestingData")
        .waitForElementVisible("#done", 5000)
      .url("http://localhost:3000/Wrangler/testing/geneExpressionTesting")
        .waitForElementVisible("#data", 5000)
        .verify.containsText("#data", "No data")
    ;

    // Create a new submission
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    var descriptionTextArea = "#submission-options > div:nth-child(1) > textarea";
    client
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 5000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 5000)
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/sample_contrast.tsv")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".edit-wrangler-file select[name=file_type]", 35000)

      // set the wrangler file options
      .click(".edit-wrangler-file select[name=file_type] option[value=ContrastMatrix]")
      .pause(1000)
      // briefly check to make sure there's an error message if we try to
      // update and there's no existing contrasts
      .click(".edit-wrangler-file select[name=update_or_create] option[value=update]")
      .pause(500)
      .verify.containsText(".edit-wrangler-file .alert",
          "Oh snap! You have no contrasts you can update. " +
          "Note that only the owner of a contrast can update it.")
      .click(".edit-wrangler-file select[name=update_or_create] option[value=create]")
      .pause(500)
      .clearValue(".edit-wrangler-file input[name=contrast_label]")
      .setValue(".edit-wrangler-file input[name=contrast_label]", "test_contrast")
      .pause(100)
      .clearValue(".edit-wrangler-file input[name=description]")
      .setValue(".edit-wrangler-file input[name=description]", "test contrast description")
      .pause(500)
      .click("body") // so that it knows to start processing again
      // set collaboration label last because sometimes nightwatch doesn't
      // record the last text field filled in with autoupdate
      .click(".edit-wrangler-file select[name='collaboration_label'] option[value='testing']")
      .waitForElementVisible("#submissionFiles .panel-success", 35000)

      // check review documents
      .verify.containsText("#review-contrast_summary tr > td:nth-child(1)", "test_contrast")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(2)", "1")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(3)", "test contrast description")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(4)", "Test group 2")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(5)", "2")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(6)", "Test group 1")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(7)", "2")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(1)", "test_contrast")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(2)", "1")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(3)", "prad_test")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(4)", "DTB-001")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(5)", "Test group 2")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(2) > td:nth-child(4)", "DTB-002")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(2) > td:nth-child(5)", "Test group 2")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(3) > td:nth-child(4)", "DTB-003Pro")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(3) > td:nth-child(5)", "Test group 1")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(1)", "prad_test")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(2)", "DTB-001")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(3)", "DTB-001")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(3) > td:nth-child(2)", "DTB-003")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(3) > td:nth-child(3)", "DTB-003Pro")

      // set submission options, submit
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, "contrast testing")
      .pause(300)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000)

      // make sure the data are there
      .url("http://localhost:3000/Wrangler/testing/contrastTesting")
      .waitForElementVisible("#data", 5000)
      .waitForElementVisible("#data > table > tbody > tr > td:nth-child(7)", 3000)
      .verify.containsText("#data > table > tbody > tr > td:nth-child(1)", "test_contrast")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(2)", "1")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(3)", "test contrast description")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(4)", "Test group 2")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(5) > ol > li:nth-child(1)", "prad_test-DTB-001-DTB-001")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(5) > ol > li:nth-child(2)", "prad_test-DTB-002-DTB-002")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(6)", "Test group 1")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(7) > ol > li:nth-child(1)", "prad_test-DTB-003-DTB-003Pro")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(7) > ol > li:nth-child(2)", "prad_test-DTB-004-DTB-004")
      .url("http://localhost:3000/Wrangler/testing/studyTesting")
      .waitForElementVisible("#data", 5000)
      .reviewStudy("prad_test", [
        { patient_label: "DTB-001", sample_label: "DTB-001" },
        { patient_label: "DTB-002", sample_label: "DTB-002" },
        { patient_label: "DTB-003", sample_label: "DTB-003Pro" },
        { patient_label: "DTB-004", sample_label: "DTB-004" },
      ])

      // add a version 2
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 5000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 5000)
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/sample_contrast2.tsv")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".edit-wrangler-file select[name=file_type]", 35000)

      // set file options
      .click(".edit-wrangler-file select[name=file_type] option[value=ContrastMatrix]")
      .pause(1000)
      .click(".edit-wrangler-file select[name=collaboration_label] option[value=testing]")
      .click(".edit-wrangler-file select[name=update_or_create] option[value=update]")
      .pause(500)
      // make sure there are no duplicates in contrast name list
      // NOTE: this test needs to be moved somewhere else... (there's only one contrast at this point)
      .verify.elementNotPresent(".edit-wrangler-file select[name=contrast_label] option:nth-child(3)")
      .click(".edit-wrangler-file select[name=contrast_label] option[value=test_contrast]")
      .verify.elementNotPresent(".edit-wrangler-file input[name=description]")
      .waitForElementVisible("#submissionFiles .panel-success", 35000)

      // check review documents
      .verify.containsText("#review-contrast_summary tr > td:nth-child(1)", "test_contrast")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(2)", "2")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(3)", "test contrast description")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(4)", "Test group 2")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(5)", "2")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(6)", "Test group 1")
      .verify.containsText("#review-contrast_summary tr > td:nth-child(7)", "3")
      .verify.containsText("#review-contrast_sample tbody > tr:nth-child(1) > td:nth-child(2)", "2")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(1)", "prad_test")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(2)", "DTB-005")
      .verify.containsText("#review-new_clinical_data tbody > tr:nth-child(1) > td:nth-child(3)", "DTB-005Pro")
      .verify.elementNotPresent("#review-new_clinical_data tbody > tr:nth-child(2)") // only one new clinical thing

      // set submission options, submit
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, "contrast version 2 testing")
      .pause(300)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000)

      // make sure the data is there
      .url("http://localhost:3000/Wrangler/testing/contrastTesting")
      .waitForElementVisible("#data", 5000)
      .waitForElementVisible("#data > table > tbody > tr > td:nth-child(7)", 3000)
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(1)", "test_contrast")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(2)", "2")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(3)", "test contrast description")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(4)", "Test group 2")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(5) > ol > li:nth-child(1)", "prad_test-DTB-001-DTB-001")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(5) > ol > li:nth-child(2)", "prad_test-DTB-002-DTB-002")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(6)", "Test group 1")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(7) > ol > li:nth-child(1)", "prad_test-DTB-003-DTB-003Pro")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(7) > ol > li:nth-child(2)", "prad_test-DTB-004-DTB-004")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(7) > ol > li:nth-child(3)", "prad_test-DTB-005-DTB-005")
      .url("http://localhost:3000/Wrangler/testing/studyTesting")
      .waitForElementVisible("#data", 5000)
      .reviewStudy("prad_test", [
        { patient_label: "DTB-001", sample_label: "DTB-001" },
        { patient_label: "DTB-002", sample_label: "DTB-002" },
        { patient_label: "DTB-003", sample_label: "DTB-003Pro" },
        { patient_label: "DTB-004", sample_label: "DTB-004" },
        { patient_label: "DTB-005", sample_label: "DTB-005Pro" },
      ])
    ;

    client.end();
  },
};
