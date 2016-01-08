module.exports = {
  tags: ["gistic", "travis"],
  "Upload some gistic files": function (client) {
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

    var urlInput = "form.add-from-web-form input[name='urlInput']";
    var descriptionTextArea = '#submission-options > div:nth-child(1) > textarea';
    var studyLabel = "#submission-options select[name='study_label']";
    var collaborationLabel = "#submission-options select[name='collaboration_label']";

    // Create a new submission
    client
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 5000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 5000)
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/gistic_fixed_small.txt")
      .click("form.add-from-web-form button[type=submit]")
      .waitForElementVisible("#submissionFiles .panel-warning", 35000)

      // set the wrangler file options
      .click(".edit-wrangler-file select[name=file_type] option[value=RectangularGeneAnnotation]")
      .pause(1000)
      .click(".edit-wrangler-file select[name=annotation_type] option[value=gistic_copy_number]")
      .waitForElementVisible("#submissionFiles .panel-success", 35000)

      // check review documents
      .verify.containsText("#review-assay_sample_summary tbody > tr:nth-child(1) > th", "DTB-005")
      .verify.containsText("#review-assay_sample_summary tbody > tr:nth-child(1) > td:nth-child(2)", "GISTIC copy number")
      .verify.containsText("#review-assay_sample_summary tbody > tr:nth-child(1) > td:nth-child(3)", "4")
      .verify.containsText("#review-assay_sample_summary tbody > tr:nth-child(2) > th", "DTB-009")
      .verify.containsText("#review-assay_sample_summary tbody > tr:nth-child(3) > th", "DTB-010Pro2")
      .verify.containsText("#review-ignored_genes > table > tbody > tr > td", "LOC729737")
      .verify.elementNotPresent("#review-ignored_genes > table > tbody > tr:nth-child(2)") // DDX11L1|chr1 is okay (not ignored)

      // set submission options, submit
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, "isoform testing")
      .click(studyLabel + " > option:nth-child(2)")
      .click(collaborationLabel + " > option:nth-child(2)")
      .pause(500)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000) // wait for it

      // make sure the data is there
      .url("http://localhost:3000/Wrangler/testing/geneAnnotationTesting")
      .waitForElementVisible("#data", 5000)
      .waitForElementVisible("#data > table > tbody > tr:nth-child(12)", 5000)
      .verify.elementNotPresent("#data > table > tbody > tr:nth-child(13)")
      .verify.containsText("#data > table > tbody > tr:nth-child(1) > td:nth-child(1)", "DDX11L1")
      .verify.containsText("#data > table > tbody > tr:nth-child(1) > td:nth-child(2)", "prad_test")
      .verify.containsText("#data > table > tbody > tr:nth-child(1) > td:nth-child(3)", "testing")
      .verify.containsText("#data > table > tbody > tr:nth-child(1) > td:nth-child(4)", "DTB-005")
      .verify.containsText("#data > table > tbody > tr:nth-child(1) > td:nth-child(5)", "0.06")
      .verify.containsText("#data > table > tbody > tr:nth-child(3) > td:nth-child(1)", "DDX11L1")
      .verify.containsText("#data > table > tbody > tr:nth-child(3) > td:nth-child(5)", "-0.252")
      .verify.containsText("#data > table > tbody > tr:nth-child(3) > td:nth-child(1)", "DDX11L1")
      .verify.containsText("#data > table > tbody > tr:nth-child(3) > td:nth-child(5)", "-0.252")
      .verify.containsText("#data > table > tbody > tr:nth-child(4) > td:nth-child(1)", "FAM138A")
      .verify.containsText("#data > table > tbody > tr:nth-child(4) > td:nth-child(5)", "0.06")
      .verify.containsText("#data > table > tbody > tr:nth-child(12) > td:nth-child(1)", "WASH7P")
      .verify.containsText("#data > table > tbody > tr:nth-child(12) > td:nth-child(5)", "-0.252")
      .url("http://localhost:3000/Wrangler/testing/studyTesting")
      .waitForElementVisible("#data", 5000)
      .reviewStudy("prad_test", [
        { patient_label: "DTB-005", sample_label: "DTB-005" },
        { patient_label: "DTB-009", sample_label: "DTB-009" },
        { patient_label: "DTB-010", sample_label: "DTB-010Pro2" },
      ])
    ;

    client.end();
  },
};
