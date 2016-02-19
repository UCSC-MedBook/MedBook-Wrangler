module.exports = {
  tags: ["signature", "travis"],
  "Upload some signature files": function (client) {
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
      .setValue(urlInput, "http://localhost:3000/sample_limma_output.tsv")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".edit-wrangler-file select[name=file_type]", 35000)

      // set the wrangler file options
      .click(".edit-wrangler-file select[name=file_type] option[value=LimmaSignature]")
      .pause(1000)
      .click(".edit-wrangler-file select[name='collaboration_label'] option[value='testing']")
      // briefly check to make sure there's an error message if we try to
      // update and there's no existing contrasts
      .click(".edit-wrangler-file select[name=update_or_create] option[value=update]")
      .pause(500)
      .verify.containsText(".edit-wrangler-file .alert",
          "Oh snap! You have no signatures you can update. " +
          "Note that only the owner of a signature can update it.")
      .click(".edit-wrangler-file select[name=update_or_create] option[value=create]")
      .pause(500)
      .clearValue(".edit-wrangler-file input[name=signature_label]")
      .setValue(".edit-wrangler-file input[name=signature_label]", "test_signature")
      .pause(100)
      .clearValue(".edit-wrangler-file input[name=description]")
      .setValue(".edit-wrangler-file input[name=description]", "test signature description")
      .click(".edit-wrangler-file select[name=algorithm] option[value=limma]")
      .click(".edit-wrangler-file select[name=features_type] option[value=genes]")
      .pause(500)
      .click("body") // so that it knows to start processing again

      // wait for it to be done
      .waitForElementVisible("#submissionFiles .panel-success", 35000)

      // check review documents
      .verify.containsText("#review-signature_summary tr > td:nth-child(1)", "test_signature")
      .verify.containsText("#review-signature_summary tr > td:nth-child(2)", "1")
      .verify.containsText("#review-signature_summary tr > td:nth-child(3)", "test signature description")
      .verify.containsText("#review-signature_summary tr > td:nth-child(4)", "limma")
      .verify.containsText("#review-signature_summary tr > td:nth-child(5)", "genes")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(1)", "test_signature")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(2)", "1")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(3)", "AAAS")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(4)", "2.01990329607699")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(5)", "0.267006655112659")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(6)", "0.42731732841758")
      .click("#review-feature_summary .loadMore")
      .waitForElementVisible("#review-feature_summary tbody > tr:nth-child(5)", 5000)
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(5) > td:nth-child(3)", "GGACT")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(5) > td:nth-child(4)", "-1.00424904845887")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(5) > td:nth-child(5)", "0.202753115691264")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(5) > td:nth-child(6)", "0.42731732841758")

      // set submission options, submit
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, "signature testing")
      .pause(300)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000)

      // make sure the data are there
      .url("http://localhost:3000/Wrangler/testing/signatureTesting")
      .waitForElementVisible("#data", 5000)
      .waitForElementVisible("#data > table > tbody > tr", 3000)
      .verify.containsText("#data > table > tbody > tr > td:nth-child(1)", "test_signature")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(2)", "1")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(3)", "test signature description")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(4)", "limma")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(5)", "genes")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(6) > ol > li:nth-child(1)", "AAAS|2.01990329607699|0.267006655112659|0.42731732841758")
      .verify.containsText("#data > table > tbody > tr > td:nth-child(6) > ol > li:nth-child(4)", "AAGAB|0.610233814721174|0.734099687482216|0.734099687482216")

      // upload a second version
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 5000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 5000)
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/sample_limma_output2.tsv")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".edit-wrangler-file select[name=file_type]", 35000)

      // set file options
      .click(".edit-wrangler-file select[name=file_type] option[value=LimmaSignature]")
      .pause(1000)
      .click(".edit-wrangler-file select[name=collaboration_label] option[value=testing]")
      // briefly try to create with the same name
      .click(".edit-wrangler-file select[name=update_or_create] option[value=create]")
      .pause(500)
      .clearValue(".edit-wrangler-file input[name=signature_label]")
      .setValue(".edit-wrangler-file input[name=signature_label]", "test_signature")
      .pause(100)
      .clearValue(".edit-wrangler-file input[name=description]")
      .setValue(".edit-wrangler-file input[name=description]", "test signature description")
      .click(".edit-wrangler-file select[name=algorithm] option[value=limma]")
      .click(".edit-wrangler-file select[name=features_type] option[value=genes]")
      .pause(500)
      .click("body") // so that it knows to start processing again
      .waitForElementVisible("#submissionFiles .panel-warning", 35000)
      .verify.containsText(".alert-warning", "Signature with that name already exists")
      // done with that foray
      .click(".edit-wrangler-file select[name=update_or_create] option[value=update]")
      .pause(500)
      .click(".edit-wrangler-file select[name=signature_label] option[value=test_signature]")
      .verify.elementNotPresent(".edit-wrangler-file input[name=description]")
      .verify.elementNotPresent(".edit-wrangler-file select[name=algorithm]")
      .verify.elementNotPresent(".edit-wrangler-file select[name=features_type]")
      .waitForElementVisible("#submissionFiles .panel-success", 35000)

      // check review documents
      .verify.containsText("#review-signature_summary tr > td:nth-child(1)", "test_signature")
      .verify.containsText("#review-signature_summary tr > td:nth-child(2)", "2")
      .verify.containsText("#review-signature_summary tr > td:nth-child(3)", "test signature description")
      .verify.containsText("#review-signature_summary tr > td:nth-child(4)", "limma")
      .verify.containsText("#review-signature_summary tr > td:nth-child(5)", "genes")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(1)", "test_signature")
      .verify.containsText("#review-feature_summary tbody > tr:nth-child(1) > td:nth-child(2)", "2")

      // set submission options, submit
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, "signature testing 2")
      .pause(300)
      .click(".validate-and-submit")
      .waitForElementVisible("#optionsAndSubmit .panel-success", 35000)

      // make sure the data are there
      .url("http://localhost:3000/Wrangler/testing/signatureTesting")
      .waitForElementVisible("#data", 5000)
      .waitForElementVisible("#data > table > tbody > tr", 3000)
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(1)", "test_signature")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(2)", "2")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(3)", "test signature description")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(4)", "limma")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(5)", "genes")
      .verify.containsText("#data > table > tbody > tr:nth-child(2) > td:nth-child(6) > ol > li:nth-child(2)", "GGACT|43|0.202753115691264|0.42731732841758") // 43 is different
    ;

    client.end();
  },
};
