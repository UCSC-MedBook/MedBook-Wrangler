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

    client.end();
  },
};
