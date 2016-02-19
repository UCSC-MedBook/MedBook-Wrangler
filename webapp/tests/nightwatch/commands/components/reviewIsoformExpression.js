function tableCell(row, column) {
  return '#data > table > tbody > tr:nth-child(' + row + ') ' +
      '> td:nth-child(' + column + ')';
}

function checkUndefined(value) {
  if (value === undefined) {
    return 'undefined';
  }
  return value;
}

exports.command = function(row, doc) {
  this
    .verify.containsText(tableCell(row, 1), checkUndefined(doc.transcript_label))
    .verify.containsText(tableCell(row, 2), checkUndefined(doc.gene_label))
    .verify.containsText(tableCell(row, 3), checkUndefined(doc.study_label))
    .verify.containsText(tableCell(row, 4), checkUndefined(doc.collaborations))
    .verify.containsText(tableCell(row, 5), checkUndefined(doc.sample_label))
    .verify.containsText(tableCell(row, 6), checkUndefined(doc.values.quantile_counts))
    .verify.containsText(tableCell(row, 7), checkUndefined(doc.values.quantile_counts_log))
    .verify.containsText(tableCell(row, 8), checkUndefined(doc.values.raw_counts))
    .verify.containsText(tableCell(row, 9), checkUndefined(doc.values.tpm))
    .verify.containsText(tableCell(row, 10), checkUndefined(doc.values.fpkm))
  ;

  return this; // allows the command to be chained.
};
