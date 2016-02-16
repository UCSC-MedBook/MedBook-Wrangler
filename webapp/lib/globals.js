// _ = lodash;

getSubmissionTypes = function (submission_id) {
  var wranglerFiles = WranglerFiles.find().fetch();

  var uniqueTypes = _.uniq(_.pluck(wranglerFiles, 'submission_type'));
  filtered = _.filter(uniqueTypes, function (value) {
    return value !== "metadata";
  });

  if (filtered.length === 0 && uniqueTypes.indexOf("metadata") !== -1) {
    return ["metadata"];
  }
  return filtered;
};
