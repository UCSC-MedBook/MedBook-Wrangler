var newSubmission = {
  status: "editing"
};

module.exports = {
  "Upload 100mb file and delete": function (client) {
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

    // add a file using the URL option
    // This is a 100mb test file hosted by Azrue.
    // I'm using such a large file so I can check the uploading UI.
    var largeFileUrl =
        "https://azspwestus.blob.core.windows.net/azurespeed/100MB.bin";
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    client
      .clearValue(urlInput)
      .setValue(urlInput, largeFileUrl)
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('div.panel-heading span.badge', 2000)
      .verify.value(urlInput, "")
      .reviewSubmissionFile({
        blob_name: "100MB.bin",
        parsed_options_once_already: false,
        status: "uploading",
        written_to_database: false,
      })
    ;

    // delete the large file
    client
      .click(".panel-title .pull-right .remove-this-file").pause(200)
      .verify.elementNotPresent(".ellipsis-out-before-badge")
    ;

    client.end();
  },
};
