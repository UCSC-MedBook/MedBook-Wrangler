var path = require('path');

var newSubmission = {
  status: "editing"
};

var waitForMongo = 15000;

module.exports = {
  "BD2KGeneExpression upload and other stuff": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(1000)
      .reviewMainLayout()
      .signIn("bonjour@meteor.com","bonjour")
    ;

    // Create a new submission
    client
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission').pause(1000)
      .reviewEditSubmission(newSubmission)
    ;

    // review empty Review section
    var reviewWellSelector = '#reviewWranglerDocuments div.well';
    client
      .verify.elementPresent(reviewWellSelector)
      .verify.containsText(reviewWellSelector, "Upload files to continue")
    ;

    var urlInputSelector = "form.add-from-web-form input[name='urlInput']";
    var DTBNormCountsWranglerFile = {
      blob_line_count: 20501,
      blob_name: "DTB-999_Baseline.rsem.genes.norm_counts.tab",
      blob_text_sample:
        "gene_id DTB-999_Baseline\nA1BG 0\nA1CF 0\nA2BP1 0\nA2LD1 505.412273",
      options: {
        file_type: "BD2KGeneExpression",
        normalization: "counts",
      },
      parsed_options_once_already: true,
      status: "done",
      written_to_database: false,
    };
    client
      .clearValue(urlInputSelector)
      .setValue(urlInputSelector,
          "http://localhost:3000/DTB-999_Baseline.rsem.genes.norm_counts.tab")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('.panel-info', 3000)
        .verify.value(urlInputSelector, "")
        .reviewSubmissionFile({
          blob_name: "DTB-999_Baseline.rsem.genes.norm_counts.tab",
          status: "processing",
          parsed_options_once_already: false,
          written_to_database: false,
        })
      .waitForElementVisible('.file-options form.edit-wrangler-file', waitForMongo)
        .reviewSubmissionFile(DTBNormCountsWranglerFile)
    ;

    // make sure the "Auto" option works
    client
      .click(".panel-body select[name='file_type'] > option:nth-child(1)")
      .reviewSubmissionFile({
        blob_name: "DTB-999_Baseline.rsem.genes.norm_counts.tab",
        status: "processing",
        blob_line_count: 20501,
        blob_text_sample:
          "gene_id DTB-999_Baseline\nA1BG 0\nA1CF 0\nA2BP1 0\nA2LD1 505.412273",
        written_to_database: false,
      })
      .waitForElementVisible('.panel-success', waitForMongo)
        .reviewSubmissionFile(DTBNormCountsWranglerFile)
    ;

    // // try to say it's other file types
    // client
    //   .click(".panel-body select[name='file_type'] option[value='MutationVCF']")
    //   .waitForElementVisible('.panel-danger', waitForMongo)
    //     .verify.containsText(".panel-danger .alert-warning",
    //         "Error parsing .vcf file")
    //   .click(".panel-body select[name='file_type'] option[value='BD2KSampleLabelMap']")
    //   .waitForElementVisible('.panel-danger', waitForMongo)
    //     .verify.containsText(".panel-danger .alert-warning",
    //         "No column with header 'Sample_Name'")
    //   .click(".panel-body select[name='file_type'] option[value='TCGAGeneExpression']")
    //   .waitForElementVisible('.panel-danger', waitForMongo)
    //     .verify.containsText(".panel-danger .alert-warning",
    //         "expected 'Hybridization REF' to start file")
    //   // TODO: try to set as clinical
    //   // .click(".panel-body select[name='file_type'] option[value='TCGAGeneExpression']")
    //   // .waitForElementVisible('.panel-danger', waitForMongo)
    //   //   .verify.containsText(".panel-danger .alert-warning",
    //   //       "expected 'Hybridization REF' to start file")
    // ;

    // delete the file
    client
      .click(".remove-this-file").pause(200)
      .verify.elementNotPresent(".panel-title .ellipsis-out-before-badge")
    ;

    var mutationVCF = {
      blob_line_count: 96, // not actually, but sample text has two less '\n's
      blob_name: "DTB-BC-999.anno.fix.vcf",
      blob_text_sample:
        "##contig=<ID=chr1,length=249250621,assembly=hg19>\n" +
        "##contig=<ID=chr10,length=135534747,assembly=hg19>\n" +
        "##contig=<ID=chr11,length=135006516,assembly=hg19>",
      options: {
        file_type: "MutationVCF",
      },
      parsed_options_once_already: true,
      status: "done",
      written_to_database: false,
    };
    client
      .clearValue(urlInputSelector)
      .setValue(urlInputSelector,
          "http://localhost:3000/DTB-BC-999.anno.fix.vcf")
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('.panel-info', 3000)
        .verify.value(urlInputSelector, "")
      .waitForElementVisible('.file-options form.edit-wrangler-file', waitForMongo)
        .reviewSubmissionFile(mutationVCF)
        .verify.elementPresent(".dataTables_wrapper")
        .verify.elementPresent('select[name="biological_source"')
        .verify.elementPresent('select[name="mutation_impact_assessor"]')
    ;

    client.end();
  },
};
