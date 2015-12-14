
exports.command = function(wranglerFilePart, waitForMongo) {
  var urlInputSelector = "form.add-from-web-form input[name='urlInput']";

  wranglerFilePart.written_to_database = false;

  // _.extend would be so nice
  var firstPart = Object.create(wranglerFilePart);
  firstPart.status = "processing";
  firstPart.parsed_options_once_already = false;

  // _.extend would be so nice
  var secondPart = Object.create(wranglerFilePart);
  secondPart.status = "done";
  secondPart.parsed_options_once_already = true;
  
  this
    .clearValue(urlInputSelector)
    .setValue(urlInputSelector,
        "http://localhost:3000/" + wranglerFilePart.blob_name)
    .click("form.add-from-web-form button[type='submit']")
    .waitForElementVisible('.panel-info', 3000)
      .verify.value(urlInputSelector, "")
      .reviewSubmissionFile(firstPart)
    .waitForElementVisible('.file-options form.edit-wrangler-file', waitForMongo)
      .reviewSubmissionFile(secondPart)
  ;

  return this;
};
