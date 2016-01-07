module.exports = {
  tags: ["isoform_expression", "travis"],
  "Upload some RectangularIsoformExpression files": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(2000)
      .reviewMainLayout()
      .createTestingUser()
      .signIn("testing@medbook.ucsc.edu", "testing")
    ;

    // remove testing data
    // check to see that testing data has "No data" in '#data'
    client
      .url('http://localhost:3000/Wrangler/testing/removeTestingData')
        .waitForElementVisible('#done', 5000)
      .url('http://localhost:3000/Wrangler/testing/geneExpressionTesting')
        .waitForElementVisible('#data', 2000)
        .verify.containsText('#data', 'No data')
    ;

    // Create a new submission
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    var descriptionTextArea = '#submission-options > div:nth-child(1) > textarea';
    var studyLabel = "#submission-options select[name='study_label']";
    var collaborationLabel = "#submission-options select[name='collaboration_label']";
    client
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 2000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 2000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/three_samples.rsem.isoform.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 35000)
      .verify.containsText('#blob_line_count', '[21 lines not shown]')
      .verify.elementPresent('.edit-wrangler-file select[name="file_type"]')
      .verify.elementPresent('.edit-wrangler-file select[name="normalization"]')

      // check review documents
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(1) > th", "DTB-152")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(1) > td:nth-child(2)", "Quantile normalized counts")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(1) > td:nth-child(3)", "25")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(2) > th", "DTB-156")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(2) > td:nth-child(2)", "Quantile normalized counts")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(2) > td:nth-child(3)", "25")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(3) > th", "DTB-156Pro")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(3) > td:nth-child(2)", "Quantile normalized counts")
      .verify.containsText("#review-sample_normalization > table > tbody > tr:nth-child(3) > td:nth-child(3)", "25")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(1) > td:nth-child(1)", "?")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(1) > td:nth-child(2)", "UBE2Q2P2")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(1)", "A2BP1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(2)", "RBFOX1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(3) > td:nth-child(1)", "A2LD1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(3) > td:nth-child(2)", "GGACT")

      // set options for submission
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, 'isoform testing')
      .click(studyLabel + ' > option:nth-child(2)')
      .click(collaborationLabel + ' > option:nth-child(2)')
      .pause(500)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000) // wait for it

      // make sure the data are there
      .url('http://localhost:3000/Wrangler/testing/isoformExpressionTesting')
      .waitForElementVisible('#data > table > tbody > tr:nth-child(75)', 5000)
      .pause(500)
      .verify.elementNotPresent('#data > table > tbody > tr:nth-child(76)')
      .reviewIsoformExpression(1, {
        "collaborations" : [ "testing" ],
        "gene_label" : "A2ML1",
        "sample_label" : "DTB-156Pro",
        "study_label" : "prad_test",
        "transcript_label" : "uc001quz",
        "transcript_version" : 3,
        "values" : {
          "quantile_counts" : 0,
          "quantile_counts_log" : 0
        }
      })
      .reviewIsoformExpression(3, {
        "collaborations" : [ "testing" ],
        "gene_label" : "A2ML1",
        "sample_label" : "DTB-152",
        "study_label" : "prad_test",
        "transcript_label" : "uc001quz",
        "transcript_version" : 3,
        "values" : {
          "quantile_counts" : 0,
          "quantile_counts_log" : 0
        }
      })
      .reviewIsoformExpression(17, {
        // NOTE: gene_label undefined
        "collaborations" : [ "testing" ],
        "sample_label" : "DTB-156",
        "study_label" : "prad_test",
        "transcript_label" : "uc001vos",
        "transcript_version" : 2,
        "values" : {
          "quantile_counts" : 11.4123000000000001,
          "quantile_counts_log" : 3.6336985666121873
        }
      })

      // make sure it's added to studies and Clinical_Info
      .url('http://localhost:3000/Wrangler/testing/studyTesting')
      .reviewStudy("prad_test", [
        { patient_label: "DTB-152", sample_label: "DTB-152" },
        { patient_label: "DTB-156", sample_label: "DTB-156" },
        { patient_label: "DTB-156", sample_label: "DTB-156Pro" },
      ])
    ;

    client.end();
  },
};
