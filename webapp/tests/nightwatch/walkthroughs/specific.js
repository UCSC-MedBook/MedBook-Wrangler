module.exports = {
  "Upload some BD2KGeneExpression files": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(1000)
      .reviewMainLayout()
    ;

    // make sure user exists and log in
    client
      .timeoutsAsyncScript(1000)
      .executeAsync(function(data, done){
        Accounts.createUser({
          email: 'testing@medbook.ucsc.edu',
          password: 'testing',
          profile: {
            collaborations: ['testing']
          }
        }, done);
      })
      .executeAsync(function(data, done) {
        Meteor.logout(done);
      })
      .signIn("testing@medbook.ucsc.edu", "testing")
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
        'gene_id DTB-999_Baseline\nA2BP1 0\nA2LD1 505.412273\nAAAS 1387.280005\nAADAT 1677.433726')
      .verify.containsText('#blob_line_count', '[5 lines not shown]')
      .verify.elementPresent('.edit-wrangler-file select[name="file_type"]')
      .verify.elementPresent('.edit-wrangler-file select[name="normalization"]')

      // check review documents
      .verify.elementPresent('#review-ignored_genes')
      .verify.containsText('#review-ignored_genes > table > tbody > tr > td', 'NOTAGENE')

      .verify.elementPresent('#review-mapped_genes')
      .verify.containsText('#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(1)', 'A2LD1')
      .verify.containsText('#review-mapped_genes > table > tbody > tr:nth-child(2) > td:nth-child(2)', 'GGACT')
      // .verify.elementPresent('#review-mapped_genes .loadMore')

      .verify.elementPresent('#review-sample_normalization')
      .verify.containsText(geneCountsPanel + ' > tr > th ', 'DTB-999')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(2)', 'Quantile normalized counts')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(3)', '7')
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
        .setValue(descriptionTextArea, 'quantile counts testing')
        .click(studyLabel + ' > option:nth-child(2)').pause(200)
      .click('.validate-and-submit').pause(500)
        .verify.containsText('#submission-options > div.form-group.has-error > span',
            'Collaboration label is required')
        .click(collaborationLabel + ' > option:nth-child(2)')
        .click('.save-for-later')
      .refresh()
        .waitForElementVisible('.validate-and-submit', 2000)
        .click('.validate-and-submit')
        .waitForElementVisible('#optionsAndSubmit > div > div:nth-child(2) > div.panel-success', 15000)
    ;

    // make sure the data are there :)
    client
      .url('http://localhost:3000/Wrangler/testing/geneExpressionTesting')
        .waitForElementVisible('#data', 2000).pause(200)
        .reviewGeneExpression(1, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "AAAS",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "quantile_counts" : 1387.2800050000000738,
            "quantile_counts_log" : 10.4390828620049518
          }
        })
        .reviewGeneExpression(6, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "GGACT",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "quantile_counts" : 505.4122730000000274,
            "quantile_counts_log" : 8.9841685589597766
          }
        })
        .reviewGeneExpression(7, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "RBFOX1",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "quantile_counts" : 0,
            "quantile_counts_log" : 0
          }
        })
        .verify.elementNotPresent('#data > table > tbody > tr:nth-child(8)')
    ;

    // add another BD2K file (tpm this time)
    client
      .url('http://localhost:3000/Wrangler')
      .waitForElementVisible('#create-new-submission', 2000)
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_tpm.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 15000)
      // check some random stuff
      .verify.containsText('#blob_line_count', '[3 lines not shown]')
      .verify.elementPresent('.edit-wrangler-file select[name="normalization"]')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(3)', '6')
      // fill in the bottom stuff
      .clearValue(descriptionTextArea)
      .setValue(descriptionTextArea, 'tpm testing')
      .click(studyLabel + ' > option:nth-child(2)')
      .click(collaborationLabel + ' > option:nth-child(2)')
      .click('.validate-and-submit')
      .waitForElementVisible('#optionsAndSubmit > div > div:nth-child(2) > div.panel-success', 15000)
    ;

    // make sure the data have merged correctly
    client
      .url('http://localhost:3000/Wrangler/testing/geneExpressionTesting')
        .waitForElementVisible('#data', 2000).pause(200)
        .reviewGeneExpression(1, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "AAAS",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "quantile_counts" : 1387.2800050000000738,
            "quantile_counts_log" : 10.4390828620049518
            // NOTE:tpm undefined
          }
        })
        .reviewGeneExpression(6, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "AARS2",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "tpm" : 177.5104972000000032
            // NOTE: quantile_counts undefined
          }
        })
        .reviewGeneExpression(7, {
          "study_label" : "prad_tcga",
          "collaborations" : [
            "testing"
          ],
          "gene_label" : "GGACT",
          "sample_label" : "DTB-999",
          "baseline_progression" : "baseline",
          "values" : {
            "quantile_counts" : 505.4122730000000274,
            "quantile_counts_log" : 8.9841685589597766,
            "tpm": 236.6878328
          }
        })
        .verify.elementNotPresent('#data > table > tbody > tr:nth-child(9)')
    ;

    client.end();
  },
};
