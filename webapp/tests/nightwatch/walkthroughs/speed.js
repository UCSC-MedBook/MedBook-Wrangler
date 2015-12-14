module.exports = {
  tags: ["speed"],
  "Speed test for full BD2KGeneExpression files": function (client) {
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

    var urlInput = "form.add-from-web-form input[name='urlInput']";
    var descriptionTextArea = '#submission-options > div:nth-child(1) > textarea';
    var studyLabel = '#submission-options > div:nth-child(2) > select';
    var collaborationLabel = '#submission-options > div:nth-child(3) > select';

    // add a BD2K file (full), make sure it parses quickly
    client
      .url("http://localhost:3000/Wrangler")
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 1000)

      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-127_dummy_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('#submissionFiles > .panel-success', 25000) // 25 seconds

      // set the options and submit it
      .setValue(descriptionTextArea, 'testing speed')
      .click(studyLabel + ' > option:nth-child(2)')
      .click(collaborationLabel + ' > option:nth-child(2)')
      .click('.validate-and-submit')
      .waitForElementVisible("#optionsAndSubmit .panel-success", 1.5 * 60 * 1000) // 1.5 minutes
    ;

    // add a bunch of full BD2K files, make sure they parse quickly
    client
      .url("http://localhost:3000/Wrangler")
      .verify.elementPresent("#create-new-submission")
      .click('#create-new-submission')
      .waitForElementVisible(urlInput, 1000)

      .clearValue(urlInput)
      .setValue(urlInput, 'http://localhost:3000/DTB-127_dummy_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('#submissionFiles > div:nth-child(3).panel-success', 25000) // 25 seconds

      .setValue(urlInput, 'http://localhost:3000/DTB-128_dummy_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('#submissionFiles > div:nth-child(4).panel-success', 25000) // 25 seconds

      .setValue(urlInput, 'http://localhost:3000/DTB-129_dummy_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('#submissionFiles > div:nth-child(5).panel-success', 25000) // 25 seconds

      .setValue(urlInput, 'http://localhost:3000/DTB-130_dummy_Baseline.rsem.genes.norm_counts.tab')
      .click("form.add-from-web-form button[type='submit']")
      .waitForElementVisible('#submissionFiles > div:nth-child(6).panel-success', 25000) // 25 seconds

      // set the options and submit it
      .setValue(descriptionTextArea, 'testing speed multiple files')
      .click(studyLabel + ' > option:nth-child(2)')
      .click(collaborationLabel + ' > option:nth-child(2)')
      .click('.validate-and-submit')
      .waitForElementVisible("#optionsAndSubmit .panel-success", 6 * 60 * 1000) // 6 minutes
    ;
  },
};
