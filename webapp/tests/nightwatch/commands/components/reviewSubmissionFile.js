exports.command = function(wranglerFile) {
  // check stuff that should always be there
  this
    .verify.elementPresent(".panel-title .glyphicon-file")
    .verify.containsText(".panel-title .ellipsis-out-before-badge",  wranglerFile.blob_name)
    .verify.elementPresent(".panel-title .badge")
    .verify.elementPresent(".panel-title .pull-right .remove-this-file")
    .verify.elementPresent(".panel-title .pull-right .remove-this-file .glyphicon-trash")
    .verify.containsText(".panel-title .pull-right .remove-this-file", "Delete")
  ;

  if (wranglerFile.status === "uploading") {
    this
      .verify.elementPresent(".panel-warning")
      .verify.elementPresent(".panel-body .progress")
      .verify.containsText(".panel-title .badge",  "uploading")
    ;
    // TODO: badge
  } else if (wranglerFile.status === "processing") {
    this
      .verify.elementPresent(".panel-info")
    ;
    // TODO: badge
  } else if (wranglerFile.status === "done") {
    this.verify.elementPresent("#submissionFiles .panel-success");
    // TODO: make sure the badge is there (processed / written to database)

  } else {
    console.log("NOTE: status test not defined:", wranglerFile.status);
  }

  if (wranglerFile.blob_line_count) {
    var hiddenLines =
      wranglerFile.blob_line_count - wranglerFile.blob_text_sample.match(/\n/g).length;
    this
      .verify.containsText(".panel-body .whitespace-pre", wranglerFile.blob_text_sample)
      .verify.containsText("#blob_line_count", hiddenLines)
    ;
  }

  if (wranglerFile.parsed_options_once_already === false) {
    this.verify.containsText(".panel-body .file-options .help-block",
        "Options will become available after file has been parsed for the first time.");
  } else if (wranglerFile.parsed_options_once_already === true &&
      wranglerFile.options) {
    for (var index in wranglerFile.options) {
      this.verify.value(".panel-body select[name='" + index +"']",
          wranglerFile.options[index]);
    }
  }

  return this; // allows the command to be chained.
};
