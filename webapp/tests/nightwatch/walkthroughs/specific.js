module.exports = {
  "Upload some BD2KGeneExpression files": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(1000)
      .reviewMainLayout()
      .signIn("testing@meteor.com", "testing")
    ;

    // Create a new submission
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    var geneCountsPanel = '#review-sample_normalization > table > tbody';
    client
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 15000)
      .verify.containsText('.whitespace-pre',
        'gene_id DTB-999_Baseline\nA1BG 0\nA1CF 0\nA2BP1 0\nA2LD1 505.412273')
      .verify.containsText('#blob_line_count', '[23 lines not shown]')
      .verify.elementPresent('.edit-wrangler-file select[name="file_type"]')
      .verify.elementPresent('.edit-wrangler-file select[name="normalization"]')

      // check review documents
      .verify.elementPresent('#review-ignored_genes')
      .verify.containsText('#review-ignored_genes > table > tbody > tr > td', 'NOTAGENE')

      .verify.elementPresent('#review-mapped_genes')
      .verify.containsText('#review-mapped_genes > table > tbody > tr:nth-child(4) > td:nth-child(1)', 'AACSL')
      .verify.containsText('#review-mapped_genes > table > tbody > tr:nth-child(4) > td:nth-child(2)', 'AACSP1')
      // .verify.elementPresent('#review-mapped_genes .loadMore')

      .verify.elementPresent('#review-sample_normalization')
      .verify.containsText(geneCountsPanel + ' > tr > th ', 'DTB-999')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(2)', 'Quantile normalized counts')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(3)', '25')
      .verify.elementNotPresent('#review-sample_normalization .loadMore')
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


    // go back to '/Wrangler', click on first 'Edit' button
    var descriptionTextArea = '#submission-options > div:nth-child(1) > textarea';
    var studyLabel = '#submission-options > div:nth-child(2) > select';
    var collaborationLabel = '#submission-options > div:nth-child(3) > select';
    client
      .url('http://localhost:3000/Wrangler')
      .waitForElementVisible('div.list-group > div:nth-child(2) a.btn.btn-xs.btn-primary', 2000)
      .click('h4.list-group-item-heading a.btn-primary')
        .waitForElementVisible(descriptionTextArea, 2000)
        .clearValue(descriptionTextArea)
        .setValue(descriptionTextArea, 'asdf')
        .click(studyLabel + ' > option:nth-child(2)').pause(200)
      .click('.validate-and-submit').pause(1000)
        .verify.containsText('#submission-options > div.form-group.has-error > span',
            'Collaboration label is required')
        .click(collaborationLabel + ' > option:nth-child(2)')
        .click('.save-for-later')
      .refresh()
        .click('.validate-and-submit')
        .waitForElementVisible('#optionsAndSubmit > div > div:nth-child(2) > div.panel-success', 15000)

    ;

    client.end();
  },
};
