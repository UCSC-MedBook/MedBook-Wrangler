exports.command = function(username, password) {
  this
    .waitForElementVisible(".container", 2000)
    .verify.elementPresent(".container")
      .verify.elementPresent("#top-controls")
        .verify.elementPresent("#left")
          .verify.elementPresent(".breadcrumb")
            .verify.elementPresent("li.active") // one always has to be active
        .verify.elementPresent("#center")
          .verify.elementPresent("#login-buttons");

  return this; // allows the command to be chained.
};
