var newSubmission = {
  status: "editing"
};

module.exports = {
  "Upload large file and delete": function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(1000)
      .reviewMainLayout()
      .signIn("testing@meteor.com", "testing")
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
    // This is a 50mb test file hosted by thinkbroadband.com
    // I'm using such a large file so I can check the uploading UI.
    var largeFileUrl =
        "http://download.thinkbroadband.com/50MB.zip";
    var urlInput = "form.add-from-web-form input[name='urlInput']";
    client
      .clearValue(urlInput)
      .setValue(urlInput, largeFileUrl)
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('div.panel-heading span.badge', 2000)
      .verify.value(urlInput, "")
      .verify.elementPresent(".panel-title .glyphicon-file")
      .verify.containsText(".panel-title .ellipsis-out-before-badge",  '50MB.zip')
      .verify.elementPresent(".panel-title .badge")
      .verify.elementPresent(".panel-title .pull-right .remove-this-file")
      .verify.elementPresent(".panel-title .pull-right .remove-this-file .glyphicon-trash")
      .verify.containsText(".panel-title .pull-right .remove-this-file", "Delete")
      .verify.elementPresent(".panel-warning")
      .verify.elementPresent(".panel-body .progress")
      .verify.containsText(".panel-title .badge",  "uploading")
    ;

    // delete the large file
    client
      .click(".panel-title .pull-right .remove-this-file").pause(200)
      .verify.elementNotPresent(".ellipsis-out-before-badge")
    ;

    client.end();
  },
};
