// from Fusion5
function parseCookies (request) {
  var cookies = {};
  var cookieString = request.headers.cookie;

  if (cookieString) {
    cookieString.split(';').forEach(function(cookie) {
      var parts = cookie.split('=');
      cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }

  return cookies;
}

function downloadWranglerDocuments () {
  // TODO: do some kind of authentication

  // // check if the user is logged in
  // var cookies = parseCookies(this.request);
  // console.log("cookies:", cookies);
  // var mlt = cookies.meteor_login_token;
  // var user = null;
  // if (mlt) {
  //     var hash_mlt =  Accounts._hashLoginToken(mlt);
  //     user = Meteor.users.findOne({
  //       "services.resume.loginTokens.hashedToken": hash_mlt
  //     });
  // }
  // if (user === null) {
  //   throw new Error("User must be logged in to download wrangler documents.");
  // }
  //
  // // TODO: call ensureSubmissionOwnership(user_id, submission_id)

  // prepare yourselves
  var response = this.response;

  var allPanels = Wrangler.reviewPanels[this.params.query.submission_type];
  if (!allPanels) {
    throw new Error("Submission type " + submission_type + " is not defined");
  }

  var document_type = this.params.query.document_type;
  var panel = _.findWhere(allPanels, {name: document_type});
  if (!panel) {
    throw new Error("Document type " + document_type + " is not defined");
  }

  // make sure it downloads right... Ted magic at work
  var filename = document_type + ".tsv";
  response.writeHead(200, {
    // 'Content-Type': 'text/tab-separated-values',
    'Content-Disposition': 'attachment; filename="' + filename +'"',
  });

  // header line
  var columns = panel.columns;
  for (var index in columns) {
    if (index !== "0") { // yes, index is a string
      response.write("\t"); // tabs only in between columns
    }
    response.write(columns[index].heading);
  }
  response.write("\n");

  // rest of file
  WranglerDocuments.find({
    submission_id: this.params.submission_id,
    document_type: document_type,
  }).forEach(function (doc) {
    for (var index in columns) {
      if (index !== "0") { // yes, index is a string
        response.write("\t"); // tabs only in between columns
      }
      // NOTE: call String in case it's an int
      response.write(String(doc.contents[columns[index].attribute]));
    }
    response.write("\n");
  });

  // we're done here
  response.end();
}

Router.map(function() {
  this.route("downloadWranglerDocuments", {
    path: "/Wrangler/editSubmission/:submission_id/download",
    where: "server",
    action: downloadWranglerDocuments,
  });
});
