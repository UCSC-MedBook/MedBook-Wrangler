// add tests to this file using the Nightwatch.js API
// http://nightwatchjs.org/api

module.exports = {
  "Create a submission" : function (client) {
    client
      .url("http://localhost:3000/Wrangler")
      .resizeWindow(1024, 768).pause(1000)
      .reviewMainLayout()
      .signIn("bonjour@meteor.com","bonjour")

      .createNewSubmission()
      //
      //
      //
      // .signOut()
      // .reviewMainLayout()
      .end();
  },
};
