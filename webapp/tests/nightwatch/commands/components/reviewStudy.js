exports.command = function(study_label, patientSampleList) {

  this
    .waitForElementVisible("#Clinical_Info > tbody > tr:nth-child(" + patientSampleList.length + ")", 10000)
    .pause(500)
  ;

  // collect
  var index;
  var sampleLabels = [];
  var patientLabels = [];
  for (index in patientSampleList) {
    var sample_label = patientSampleList[index].sample_label;
    var patient_label = patientSampleList[index].patient_label;

    if (sampleLabels.indexOf(sample_label) === -1) {
      sampleLabels.push(sample_label);
    }
    if (patientLabels.indexOf(patient_label) === -1) {
      patientLabels.push(patient_label);
    }
  }

  // studies
  this
    .verify.containsText("#studies > tbody > tr > td:nth-child(1)", study_label)
    .verify.containsText("#studies > tbody > tr > td:nth-child(2)", patientLabels.sort().join(","))
    .verify.containsText("#studies > tbody > tr > td:nth-child(3)", sampleLabels.sort().join(","))
  ;

  // Clinical_Info
  for (index in patientSampleList) {
    var indexPlusOne = parseInt(index, 10) + 1; // oh Javascript
    var row = "#Clinical_Info > tbody > tr:nth-child(" + indexPlusOne + ")";
    this
      .verify.containsText(row + " > td:nth-child(1)", study_label)
      .verify.containsText(row + " > td:nth-child(2)", patientSampleList[index].patient_label)
      .verify.containsText(row + " > td:nth-child(3)", patientSampleList[index].sample_label)
    ;
  }

  return this; // allows the command to be chained.
};
