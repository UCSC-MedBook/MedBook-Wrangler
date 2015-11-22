function tableCell(row, column) {
  return '#data > table > tbody > tr:nth-child(' + row + ') ' +
      '> td:nth-child(' + column + ')';
}

function blankIfNull(value) {
  if (value !== undefined) {
    return value;
  }
  return '';
}

exports.command = function(row, doc) {
  this
    .verify.containsText(tableCell(row, 1), blankIfNull(doc.gene_label))
    .verify.containsText(tableCell(row, 2), blankIfNull(doc.study_label))
    .verify.containsText(tableCell(row, 3), blankIfNull(doc.collaborations))
    .verify.containsText(tableCell(row, 4), blankIfNull(doc.sample_label))
    .verify.containsText(tableCell(row, 5), blankIfNull(doc.baseline_progression))
    .verify.containsText(tableCell(row, 6), blankIfNull(doc.values.quantile_counts))
    .verify.containsText(tableCell(row, 7), blankIfNull(doc.values.quantile_counts_log))
    .verify.containsText(tableCell(row, 8), blankIfNull(doc.values.raw_counts))
    .verify.containsText(tableCell(row, 9), blankIfNull(doc.values.tpm))
    .verify.containsText(tableCell(row, 10), blankIfNull(doc.values.fpkm))
  ;

  return this; // allows the command to be chained.
};
