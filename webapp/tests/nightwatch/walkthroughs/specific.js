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
    var geneCountsPanel = '#review-sample_normalization > table > tbody';
    client
      .url("http://localhost:3000/Wrangler")
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 15000)
      .verify.containsText('.whitespace-pre',
        'gene_id DTB-999_Baseline\nA2BP1 0\nA2LD1 505.412273\nAAAS 1387.280005\nAADAT 1677.433726')
      .verify.containsText('#blob_line_count', '[4 lines not shown]')
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

      // make sure we're not going to overwrite any data
      .assert.elementNotPresent("#review-gene_expression_data_exists")
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
        .waitForElementVisible('#data > table > tbody > tr:nth-child(7)', 5000).pause(200)
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
      .verify.containsText('#blob_line_count', '[2 lines not shown]')
      .verify.elementPresent('.edit-wrangler-file select[name="normalization"]')
      .verify.containsText(geneCountsPanel + ' > tr > td:nth-child(3)', '6')
      .verify.elementNotPresent("#review-gene_expression_data_exists")
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
        .waitForElementVisible('#data > table > tbody > tr:nth-child(8)', 5000).pause(200)
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

    // try to upload the tpm file again and make sure we get an error
    var firstDelete = "body > div > div.list-group > div:nth-child(2) > h4 > span > a.delete-submission";
    client
      .url('http://localhost:3000/Wrangler')
      .waitForElementVisible('#create-new-submission', 2000)
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_tpm.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 15000)
      .verify.elementPresent("#review-gene_expression_data_exists")
      .verify.containsText("#review-gene_expression_data_exists > table > tbody > tr > th", "DTB-999")
      .verify.containsText("#review-gene_expression_data_exists > table > tbody > tr > td:nth-child(2)", "TPM (Transcripts Per Million)")
      .verify.containsText("#review-gene_expression_data_exists > table > tbody > tr > td:nth-child(3)", "DTB-999_Baseline.rsem.genes.norm_tpm.tab")
      .click("#left > ol > li:nth-child(1) > a") // go back to submissions page
      .waitForElementVisible(firstDelete, 2000)
      .click(firstDelete) // delete it
    ;

    // add a file with an undefined sample label, make sure it doesn't work
    client
      .url('http://localhost:3000/Wrangler')
      .waitForElementVisible('#create-new-submission', 2000)
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-cool_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-warning', 15000)
      .verify.containsText("#submissionFiles div.alert.alert-warning > p",
          "Could not parse sample label from header line or file name")
      .click("#submissionFiles .remove-this-file") // delete the file
    ;

    // add a file with a UUID, make sure we couldn't parse sample label
    // (reuse submission)
    client
      // add the label mapping file
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/BD2K_rna_mapping_test.tsv')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed, make sure file type couldn't be inferred
      .waitForElementVisible('#submissionFiles > .panel-warning', 15000)
      .verify.containsText("#submissionFiles div.alert.alert-warning > p",
          "File type could not be inferred. Please manually select a file type")
      .click("#submissionFiles select > option:nth-child(3)")
      .verify.elementPresent("#submissionFiles > div.panel.panel-info") // reparsing
      .waitForElementVisible("#submissionFiles > div.panel.panel-success", 15000)

      // add UUID file
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/123456789.rsem.genes.norm_fpkm.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible("#submissionFiles > div:nth-child(3).panel-success", 15000)
      .waitForElementVisible("#review-sample_normalization", 15000)
      .verify.containsText("#review-sample_normalization > table > tbody > tr > th", "DTB-998Dup")
      .verify.containsText("#review-sample_normalization > table > tbody > tr > td:nth-child(2)",
          "RPKM (Reads Per Kilobase of transcript per Million mapped reads)")
      .verify.containsText("#review-sample_normalization > table > tbody > tr > td:nth-child(3)", "7")

      // make sure label mapping file loaded right
      .waitForElementPresent("#review-sample_label_map", 1000)
      .verify.containsText("#review-sample_label_map tbody > tr > th", "DTB-998Dup")
      .verify.containsText("#review-sample_label_map tr > td:nth-child(2)", "DTB-998-Baseline-Duplicate")
      .verify.containsText("#review-sample_label_map tr > td:nth-child(3)", "123456789")

      // set the options and submit it
      .setValue(descriptionTextArea, 'testing a UUID with FPKM')
      .click(studyLabel + ' > option:nth-child(2)')
      .click(collaborationLabel + ' > option:nth-child(2)')
      .click('.validate-and-submit')
      .waitForElementVisible("#optionsAndSubmit .panel-success", 20000)

      // make sure the data are there :)
      .url('http://localhost:3000/Wrangler/testing/geneExpressionTesting')
        .waitForElementVisible('#data > table > tbody > tr:nth-child(15)', 2000).pause(200)
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
        .reviewGeneExpression(2, {
            "study_label" : "prad_tcga",
            "collaborations" : [
                "testing"
            ],
            "gene_label" : "AAAS",
            "sample_label" : "DTB-998Dup",
            "baseline_progression" : "baseline",
            "values" : {
                "fpkm" : 12475
            }
        })
        .reviewGeneExpression(12, {
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
        .reviewGeneExpression(13, {
          "study_label" : "prad_tcga",
          "collaborations" : [
              "testing"
          ],
          "gene_label" : "GGACT",
          "sample_label" : "DTB-998Dup",
          "baseline_progression" : "baseline",
          "values" : {
              "fpkm" : 364
          }
      })
      .verify.elementNotPresent('#data > table > tbody > tr:nth-child(16)')
    ;

    // verify we can get to label mappings from a previous submission
    client
      .url('http://localhost:3000/Wrangler')
      .waitForElementVisible('#create-new-submission', 2000)
      .click('#create-new-submission').pause(1000)
      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/123456789.rsem.genes.raw_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      // wait for it to be parsed
      .waitForElementVisible('#submissionFiles .panel-success', 15000)
      // make sure label mapping file loaded right
      .verify.containsText("#review-sample_label_map tbody > tr > th", "DTB-998Dup")
      .verify.containsText("#review-sample_label_map tr > td:nth-child(2)", "DTB-998-Baseline-Duplicate")
      .verify.containsText("#review-sample_label_map tr > td:nth-child(3)", "123456789")

      // go back to the submissions page and delete it
      .click("#left > ol > li:nth-child(1) > a")
      .waitForElementNotPresent(".relative-spinner", 10000)
      .click("body > div > div.list-group > div:nth-child(2) .delete-submission")

      // make sure we deleted it
      .verify.containsText("body > div > div.list-group > div:nth-child(2) > p > span:nth-child(2)",
          "123456789.rsem.genes.norm_fpkm.tab")
    ;

    client.end();
  },
};
