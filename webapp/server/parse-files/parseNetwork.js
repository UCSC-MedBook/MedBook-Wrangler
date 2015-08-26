parseNetworkInteractions = function(fileObject, documentInsert) {
  lineByLineStream(fileObject, function (line) {
    var brokenTabs = line.split("\t");
    if (brokenTabs.length === 3) {
      //console.log("adding interaction:", line);
      documentInsert("network_interactions", {
        "source": brokenTabs[0],
        "target": brokenTabs[2],
        "interaction": brokenTabs[1],
      });
    } else {
      console.log("don't know what to do:", line);
      // setFileStatus("error");
      return;
    }
  });
};

parseNetworkElements = function(fileObject, documentInsert) {
  lineByLineStream(fileObject, function(line){
    var brokenTabs = line.split("\t");
    if (brokenTabs.length === 2) {
      // console.log("adding definition:", line);
      documentInsert("network_elements", {
        "label": brokenTabs[1],
        "type": brokenTabs[0],
      });
    } else {
      console.log("don't know what to do:", line);
      // setFileStatus("error");
      return;
    }
  });
};
