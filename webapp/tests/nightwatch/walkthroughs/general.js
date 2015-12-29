module.exports = {
  tags: ["travis", "general"],
  "General tests, error testing for switching file type": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768)
      .reviewMainLayout()

      // make sure user exists and log in
      .createTestingUser()
      .signIn("testing@medbook.ucsc.edu", "testing")
    ;

    // create a new submission
    client
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission')
        .waitForElementVisible(".well.insert-file-well", 2000)
        .verify.elementPresent(".well.insert-file-well")
        .verify.elementPresent(".insert-file-button input[type=file]") // left button
        // right button
        .verify.elementPresent('.insert-file-button input[name="urlInput"]')
        .verify.elementPresent(".insert-file-button .add-from-web-form")

        // #optionsAndSubmit
        .verify.elementPresent("#optionsAndSubmit textarea[name='description']")
        .verify.elementPresent("#optionsAndSubmit select[name='study_label']")
        .verify.elementPresent("#optionsAndSubmit select[name='collaboration_label']")
        .verify.elementPresent("#optionsAndSubmit button.reset-options")
        .verify.elementPresent("#optionsAndSubmit button.save-for-later")
        .verify.elementPresent("#optionsAndSubmit button.validate-and-submit")

        // at the bottom...
        .verify.elementPresent(".panel-heading", "Editing")
        .verify.elementPresent(".panel-body", "Click validate and submit to continue")
    ;

    // review empty Review section
    var reviewWellSelector = '#reviewWranglerDocuments div.well';
    client
      .verify.elementPresent(reviewWellSelector)
      .verify.containsText(reviewWellSelector, "Upload files to continue")
    ;

    // add a file using the URL option
    // rando image from http://imgur.com/gallery/qZMQD
    // var largeFileUrl =
    //     "http://i.imgur.com/i3BsFyU.jpg";
    // var fileName = 'i3BsFyU.jpg';
    var fileUrl =
        "http://localhost:3000/DTB-999_Baseline-bad.rsem.genes.norm_counts.tab";
    var fileName = 'DTB-999_Baseline-bad.rsem.genes.norm_counts.tab';
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    client
      .clearValue(urlInput)
      .setValue(urlInput, fileUrl)
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('div.panel-heading span.badge', 3000)
        // .verify.elementPresent(".panel-warning")
        // .verify.elementPresent(".panel-body .progress")
        // .verify.containsText(".panel-title .badge",  "uploading")
        // .verify.value(urlInput, "")
        .verify.elementPresent(".panel-title .glyphicon-file")
        .verify.containsText(".panel-title .ellipsis-out-before-badge", fileName)
        .verify.elementPresent(".panel-title .badge")
        .verify.elementPresent(".panel-title .pull-right .remove-this-file")
        .verify.elementPresent(".panel-title .pull-right .remove-this-file .glyphicon-trash")
        .verify.containsText(".panel-title .pull-right .remove-this-file", "Delete")

        // wait for the file to be done
        .waitForElementNotPresent(".panel-body .progress", 10000)
    ;

    // go back to the submissions list page and look at that
    var submissionListItem = 'div.list-group > div:nth-child(2)';
    client
      .click('#left > ol > li:nth-child(1) > a')
        .waitForElementVisible(submissionListItem + ' > h4', 2000)
        .verify.containsText(submissionListItem + ' > h4', 'a few seconds ago')
        .verify.containsText(submissionListItem + ' .badge', 'editing')
        .verify.containsText(submissionListItem + ' .btn-primary', 'Edit')
        .verify.containsText(submissionListItem + ' .btn-warning', 'Delete')
        .verify.containsText(submissionListItem + ' > p > h5', 'Files')
        .verify.containsText(submissionListItem + ' > p > span', fileName)

      // click the edit button and make sure it's still there
      .click(submissionListItem + ' .btn-primary')
      .waitForElementVisible(".ellipsis-out-before-badge", 3000)
      .verify.containsText('.ellipsis-out-before-badge', fileName)

      // test the review panels
      // NOTE: depends on RectangularGeneExpression
      .waitForElementVisible(".panel-success", 35000) // wait for file done processing
      .waitForElementVisible("#review-ignored_genes .download-as-file", 3000)
      .verify.containsText("#review-sample_normalization .download-as-file", "Download")
      .verify.containsText("#review-ignored_genes .download-as-file", "Download all 5")

      // click the "load more" button for ignored genes
      .verify.elementPresent("#review-ignored_genes .loadMore")
      .click("#review-ignored_genes .loadMore")
      .waitForElementNotPresent(".relative-spinner", 5000)
      .verify.elementNotPresent("#review-ignored_genes .loadMore")
      .verify.containsText("#review-ignored_genes .download-as-file", "Download")


      // TODO: figure out if this is possible
      // // ajax call to make sure the files look good
      // .timeoutsAsyncScript(2000)
      // .executeAsync(function (data, done) {
      //   console.log("window.location.pathname:", window.location.pathname);
      //   $.ajax({
      //     url: window.location.pathname + "/download?submission_type=gene_expression&document_type=ignored_genes",
      //     success: done,
      //   });
      // }, null, function (result) {
      //   console.log("result:", result);
      // })

      // delete the file
      .click(".panel-title .pull-right .remove-this-file").pause(200)
        .verify.elementNotPresent(".ellipsis-out-before-badge")

      // go back to the list submissions page and delete it
      .click('#left > ol > li:nth-child(1) > a')
        // deleting the file while it's uploading sometimes causes the
        // app to crash, so wait for a long enough time for it to reboot
        .waitForElementNotPresent(".relative-spinner", 10000).pause(250)
        .verify.containsText(submissionListItem + ' > p', 'No files')
        .click(submissionListItem + ' .btn-warning')
    ;


    // do some fun stuff with changing the file type, etc.
    var warningText = "#submissionFiles div.alert.alert-warning > p";
    client
      .url("http://localhost:3000/Wrangler")
      .waitForElementPresent("#create-new-submission", 2000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 10000)
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/hello.txt")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(warningText, 60000)
      .verify.containsText(warningText,
          "File type could not be inferred. Please manually select a file type")

      // select RectangularGeneExpression
      .click(".edit-wrangler-file select[name='file_type'] > option[value='RectangularGeneExpression']")
      .pause(1000)
      .verify.containsText(warningText, "Please correct the errors below.")
      .verify.containsText(".edit-wrangler-file > div.form-group.has-error > div > span",
          "Normalization is required")
      .click(".edit-wrangler-file select[name='normalization'] > option:nth-child(2)") // select normalization
      .waitForElementPresent(".panel-info", 2000)
      .verify.elementNotPresent(warningText)
      .waitForElementPresent(".panel-warning", 30000)
      .verify.containsText(warningText, "Expected 2+ column tab file, got 1 column tab file")

      // select BD2KSampleLabelMap
      .click(".edit-wrangler-file select[name='file_type'] > option[value='BD2KSampleLabelMap']")
      .waitForElementPresent(".panel-info", 2000)
      .verify.elementNotPresent(".edit-wrangler-file select[name='normalization']")
      .waitForElementPresent(".panel-warning", 30000)
      .verify.containsText(warningText, "Can't find column with header \"Sample_Name\"")

      // // select ArachneRegulon
      // .click(".edit-wrangler-file select[name='file_type'] > option[value='ArachneRegulon']")
      // .pause(1000)
      // .verify.containsText(warningText, "Please correct the errors below.")
      // .verify.containsText(".edit-wrangler-file > div.form-group.has-error > div > span",
      //     "Network name is required")
      //
      // // set network name
      // .setValue(".edit-wrangler-file input", "HelloWorld")
      // .click("#submissionFiles") // deselect field, trigger submit
      // .waitForElementPresent(".panel-info", 2000)
      // .waitForElementPresent(".panel-warning", 30000)
      // .verify.containsText(warningText, "No interactions specified for source gene hello")

      // go back to the list submissions page and delete it
      .click('#left > ol > li:nth-child(1) > a')
        // deleting the file while it's uploading sometimes causes the
        // app to crash, so wait for a long enough time for it to reboot
        .waitForElementNotPresent(".relative-spinner", 10000)
        .click(submissionListItem + ' .btn-warning')
        .verify.elementPresent("body") // so that it actually clicks
    ;

    // make sure the wrangler documents are being correctly linked to multiple
    // files and deleted right
    client
      .url("http://localhost:3000/Wrangler")
      .waitForElementVisible("#create-new-submission", 10000)
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 10000)

      // add norm_counts
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_counts.tab")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".panel-success", 60000)
      .verify.containsText("#review-ignored_genes > table > tbody > tr > td", "NOTAGENE")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(1) > td:nth-child(1)", "A2BP1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(1) > td:nth-child(2)", "RBFOX1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(1)", "A2LD1")
      .verify.containsText("#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(2)", "GGACT")
      .verify.elementNotPresent("#review-mapped_genes > table > tbody > tr:nth-child(3)")

      // add fpkm
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_fpkm.tab")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible("#submissionFiles > div:nth-child(4).panel-success", 60000)
      .verify.containsText("#review-ignored_genes tbody > tr > td", "NOTAGENE")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(1)", "A2BP1")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(2)", "RBFOX1")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(2) > td:nth-child(1)", "A2LD1")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(2) > td:nth-child(2)", "GGACT")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(3) > td:nth-child(1)", "PTS2R")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(3) > td:nth-child(2)", "PEX7")
      .verify.elementNotPresent("#review-mapped_genes tbody > tr:nth-child(4)")

      // remove norm_counts
      .click("#submissionFiles > div:nth-child(3) .remove-this-file")
      .waitForElementNotPresent("#review-mapped_genes tbody > tr:nth-child(3)", 2500)
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(1)", "A2LD1")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(2)", "GGACT")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(2) > td:nth-child(1)", "PTS2R")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(2) > td:nth-child(2)", "PEX7")
      .verify.elementNotPresent("#review-ignored_genes")

      // delete all files and add a different one (to make sure they're really gone)
      .click("#submissionFiles > div:nth-child(3) .remove-this-file")
      .clearValue(urlInput)
      .setValue(urlInput, "http://localhost:3000/DTB-999_Baseline.rsem.genes.raw_counts.tab")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible(".panel-success", 60000)
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(1)", "DIC5")
      .verify.containsText("#review-mapped_genes tbody > tr:nth-child(1) > td:nth-child(2)", "WDR34")
      .verify.elementNotPresent("#review-mapped_genes tbody > tr:nth-child(2)")

      // go back to the list submissions page and delete it
      .click('#left > ol > li:nth-child(1) > a')
        // deleting the file while it's uploading sometimes causes the
        // app to crash, so wait for a long enough time for it to reboot
        .waitForElementNotPresent(".relative-spinner", 10000)
        .click(submissionListItem + ' .btn-warning')
        .verify.elementPresent("body") // so that it actually clicks
    ;

    client.end();
  },
};
