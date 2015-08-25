// makes it easy to read a file line by line:
// calls callWithLine with each successive line of the file
function lineByLineStream(fileObject, callWithLine) {
  var byLine = Meteor.npmRequire('byline');
  var stream = byLine(fileObject.createReadStream("uploaded_files"))
    .on('data', Meteor.bindEnvironment(function (lineObject) {
      var line = lineObject.toString();
      callWithLine(line);
    }));
}

UploadedFileStore.on("stored", Meteor.bindEnvironment(
  function (storeName, fileObject) {
    if (storeName !== UploadedFileStore.name) return; // workaround for known bug
    console.log("stored file callback");

    var submissionId = WranglerSubmissions.findOne({
      "files": {
        $elemMatch: {
          "file_id": fileObject._id
        }
      }
    })._id;

    function setFileStatus(statusString) {
      WranglerSubmissions.update({
            "_id": submissionId,
            "files.file_id": fileObject._id,
          }, {
            $set: { "files.$.status": statusString }
          });
    }
    setFileStatus("processing");

    // TODO: will this make it faster to insert?
    var insertedCount = 0;
    var callbackCount = 0;
    function insertCallback(error, result) {
      if (error) {
        console.log("something went wrong adding to the database...");
        console.log(error);
      }
      callbackCount++;
      if (callbackCount === insertedCount) {
        setFileStatus("done");
        console.log("finished writing new data from file:", fileName);
      }
    }
    function documentInsert(document) {
      insertedCount++;
      WranglerDocuments.insert(document, insertCallback);
    }

    var fileName = fileObject.original.name;
    if (fileName.slice(-4) === ".sif") {
      console.log("we found a sif file (network_interactions definition):",
          fileName);

      lineByLineStream(fileObject, function (line) {
        var brokenTabs = line.split("\t");
        if (brokenTabs.length === 3) {
          //console.log("adding interaction:", line);
          documentInsert({
            "submission_id": submissionId,
            "collection_name": "network_interactions",
            "prospective_document": {
              "source": brokenTabs[0],
              "target": brokenTabs[2],
              "interaction": brokenTabs[1],
            },
          });
        } else {
          console.log("don't know what to do:", line);
          setFileStatus("error");
        }
      });
    } else if (fileName.slice(-4) === ".tab" &&
        fileName.indexOf("definitions") >= 0) {
      console.log("we found a network_elements definition file:", fileName);

      lineByLineStream(fileObject, function(line){
        var brokenTabs = line.split("\t");
        if (brokenTabs.length === 2) {
          // console.log("adding definition:", line);
          documentInsert({
            "submission_id": submissionId,
            "collection_name": "network_elements",
            "prospective_document": {
              "label": brokenTabs[1],
              "type": brokenTabs[0],
            },
          });
        } else {
          console.log("don't know what to do:", line);
          setFileStatus("error");
          return;
        }
      });
    } else if (fileName.slice(-4) === ".vcf") {
		  console.log('upload VCF', fileName);

		  var vcf = Meteor.npmRequire('vcf.js');
		  var blob = "";
		  var stream = fileObject.createReadStream("uploaded_files")
		      .on('data', function (chunk) {
		        blob += chunk;
		      })
		      .on('end', Meteor.bindEnvironment(function () {
		        //var myData = JSON.parse(stream);
		        //console.log("##file: " + myData);
		        if (blob) {
              data = vcf.parser()(blob);
		          //for (h in data.header) {
		          //    console.log('#vcf header:',h);
		          //}
		          //console.log('#DR',  data.records);
		          var len = data.records.length;
		          var mut = {};
				      mut.mutation_type = 'snp';
              for (var i = 0; i < len; i++) {
                var dx = data.records[i];
                var keys = Object.keys(dx);
                mut.gene_id = 'none';
                mut.gene_label = 'WIERD';

		            for (var k in keys) {
		              var key = keys[k];
		              var mapped_key = key;
                  // TODO: switch to switch statement
		              if (key == 'TYPE') {
		                mapped_key = 'mutation_type';
		              }
      						if (key == 'CHROM') {
      		          mapped_key = 'chromosome';
      						}
                  if (key == 'POS') {
                    mapped_key = 'start_position';
                    mut.end_position = dx[key] + 1;
                  }
                  if (key == 'REF') {
                    mapped_key = 'reference_allele';
                  }
                  if (key == 'ALT') {
                    mapped_key = 'variant_allele';
                  }
                  if (key == 'sampleNames') {
                    mapped_key = 'sample_label';
                    var sample_name = dx[key][0];
                    dx[key] = sample_name;
                    mut.sample_id = 'none';
                  }
                  if (key == 'INFO') {
                    mapped_key = 'effects';

							      effDoc = dx[key];
                    var eff_keys = Object.keys(effDoc);
							      console.log('#EFF keys',eff_keys);

      							var effArray = [];

                    // TODO: don't make functions within a loop
      							eff_keys.map(function(k) {
      								console.log('#key',k);
      								if (k == 'TYPE') {
      									console.log ('#type', effDoc[k]);
      								}
      								if (k == 'EFF') {
      									var effectsArray = effDoc[k];
      									console.log ('###EFF', effDoc[k]);
      									if (effectsArray) {
      										var anno = effectsArray.split(',');
      										console.log('anno length', anno.length);
      										for (i = 0 ; i < anno.length ; i++ )
      										{
      											var a= anno[i];
      											var firstWord = a.replace(/\(.*/,"");
      											a = a.replace(/.*\(/,"");
      											a = a.replace(/\).*/,"");
      											var values = a.split("|");
      											console.log("obtuse", firstWord, values);
      										}
      									}
      								}
      							});
						      }
      						if (mapped_key != '__HEADER__') {
      							mut[mapped_key] = dx[key];
      							console.log('dx [',mapped_key,']=',dx[key]);
      						}
		            }
					      console.log('#mut',mut);
	  				    Mutations.insert(mut);
				      }
			      }
		      })
      ); // end of .on('end')
	  } else {
      console.log("unknown file type");
      setFileStatus("error");
      return;
    }

    // TODO: check if not error before (currently just returning after each...)
    console.log("finished processing file:", fileName);
    setFileStatus("writing");
  },
  function (error) {
    // TODO: set status to error if there's an exception thrown for the file
    console.log("Error calling callback on .on('stored') for file:", error);
  }
));
