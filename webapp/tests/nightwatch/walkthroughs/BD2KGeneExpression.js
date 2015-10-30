var path = require('path');

var newSubmission = {
  status: "editing"
};



module.exports = {
  "Upload BD2K gene expression": function (client) {
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
      .waitForElementVisible('#blob_line_count', 10000)

      .waitForElementVisible('.file-options form.edit-wrangler-file', 5000)
        .reviewSubmissionFile({
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
          submission_id: "dKETrdfjASWrHXJcM",
          user_id: "yKWxvJi5ouvbjqjRQ",
          written_to_database: false,
        })
    ;

    client.end();
  },
};
