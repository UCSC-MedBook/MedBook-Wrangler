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
		var assert = Meteor.npmRequire("assert");
		var Fiber = Npm.require('fibers');
		var fs = Meteor.npmRequire("fs");
		var vcf = Meteor.npmRequire('vcf.js');
		var blob = "";
		var stream = fileObject.createReadStream("uploaded_files")
		      .on('data', function (chunk) {
		        blob += chunk;
		      })
		      .on('end', function () {
		       //var myData = JSON.parse(stream);
		       //console.log("##file: " + myData);
		       if (blob) {
		         data = vcf.parser()(blob);
		         //for (h in data.header) {
		         //    console.log('#vcf header:',h);
		         //}
		         //console.log('#DR',  data.records);
		         var len = data.records.length;
		         //console.log('len',len);
		         var mut = {};
				 mut['mutation_type'] = 'snp';
		         for (var i = 0; i < len; i++) {
		              var dx = data.records[i];
		              var keys = Object.keys(dx);
		              mut.gene_id = 'none';
		              mut['gene_label'] = 'WIERD';

		              for (k in keys) {
		                var key = keys[k];
		                var mapped_key = key;
		                if (key == 'TYPE') {
		                    mapped_key = 'mutation_type';
		                }
						if (key == 'CHROM') {
		                    mapped_key = 'chromosome';
						}
						if (key == 'POS') {
		                    mapped_key = 'start_position';
							mut['end_position'] = dx[key] + 1;
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
							mut['sample_id'] = 'none';
						}
						if (key == 'INFO') {
		                    mapped_key = 'effects';

							effDoc = dx[key];
							var eff_keys = Object.keys(effDoc);
							console.log('#EFF keys',eff_keys);

							var effArray = []
							eff_keys.map(function(k) {
								console.log('#key',k);
								if (k == 'TYPE') {
									console.log ('#type', effDoc[k])
								}
								if (k == 'EFF') {
									var effectsArray = effDoc[k];
									console.log ('###EFF', effDoc[k])
									if (effectsArray) {
										var anno = effectsArray.split(',');
										console.log('anno length', anno.length);
										for (i = 0 ; i < anno.length ; i++ )
										{
											var a= anno[i];
											var firstWord = a.replace(/\(.*/,"")
											a = a.replace(/.*\(/,"");
											a = a.replace(/\).*/,"");
											var values = a.split("|");
											console.log("obtuse", firstWord, values)
										}
										
									}

								}
							})
						};
						if (mapped_key != '__HEADER__') {
							mut[mapped_key] = dx[key];
							console.log('dx [',mapped_key,']=',dx[key]);
						}    
		              }
					  console.log('#mut',mut)
	  				  Fiber(function() {
	  						 Mutations.insert(mut);
	  				  }).run();

				}
			}
		})
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

// Robert's work

// UploadedFileStore.on("stored", function (storeName, fileObject) {
//   if (storeName !== UploadedFileStore.name) return; // workaround for known bug
//   var assert = Meteor.npmRequire("assert");
//   var fs = Meteor.npmRequire("fs");
//   // var byLine = Meteor.npmRequire('byLine');
//   var vcf = Meteor.npmRequire('vcf.js');
//   var blob = "";
//     var stream = fileObject.createReadStream("uploaded_files")
//      .on('data', function (chunk) {
//        blob += chunk;
//      })
//      .on('end', function () {
//       //var myData = JSON.parse(stream);
//       //console.log("##file: " + myData);
//       if (blob) {
//         data = vcf.parser()(blob);
//         //data = vcf.parser()(String(fs.readFileSync('/data/MedBook/MedBook-Wrangler/webapp/test.vcf')));
//         for (h in data.header) {
//             console.log('#vcf header:',h);
//         }
//         //console.log('#DR',  data.records);
//         var len = data.records.length;
//         console.log('len',len);
//         var mut = {};
//         for (var i = 0; i < len; i++) {
//              var dx = data.records[i];
//              var keys = Object.keys(dx);
//
//              console.log('keys',keys, dx);
//              mut.gene_id = 'none';
//              mut['gene_label'] = 'WIERD';
//              for (k in keys) {
//                var key = keys[k];
//                var mapped_key = key;
//                if (key == 'TYPE') {
//                    mapped_key = 'mutation_type';
//                }
//                mut[mapped_key] = dx[key];
//                console.log('dx [',mapped_key,']=',dx[key]);
//              }
//              Mutations.insert(mut);
//              /*
//              "gene_label": { type: String },
//              "gene_id": { type: String },
//              "protein_change": { type: String, optional: true },
//              "mutation_type": { type: String }, // variant_classification for us
//              "chromosome": { type: String },
//              "start_position": { type: Number },
//              "end_position": { type: Number },
//              "reference_allele": { type: String },
//              "variant_allele": { type: String },
//              "MA_FImpact": { type: String, optional: true },
//              "MA_FIS": { type: Number, optional: true },
//              "allele_count": { type: Number, label:"Allele count in genotypes, for each ALT allele, in the same order as listed", optional:true },
//              "allele_frequency": { type: Number, decimal:true, label:"Allele frequency, for each ALT allele, in the same order as listed", optional:true },
//              "allele_number": { type: Number, label:"Number of unique alleles across all samples", optional:true },
//              "base_quality": { type: Number, decimal:true, label:"Overall average base quality", optional:true },
//              "read_depth": { type: Number, label:"Total read depth for all samples", optional:true },
//              "fraction_alt": { type: Number, decimal:true, label:"Overall fraction of reads supporting ALT", optional:true },
//              "indel_number": { type: Number, label:"Number of indels for all samples", optional:true },
//              "modification_base_changes": { type: String, label:"Modification base changes at this position", optional:true },
//              "modification_types": { type: String, label:"Modification types at this position", optional:true },
//              "sample_number": { type: Number, label:"Number of samples with data", optional:true },
//              "origin": { type: String, label:"Where the call originated from, the tumor DNA, RNA, or both", optional:true },
//              "strand_bias": { type: Number, decimal:true, label:"Overall strand bias", optional:true },
//              "somatic": { type: Boolean, label:"Indicates if record is a somatic mutation", optional:true },
//              "variant_status": { type: Number, label:"Variant status relative to non-adjacent Normal, 0=wildtype,1=germline,2=somatic,3=LOH,4=unknown,5=rnaEditing" , optional:true},
//              "reads_at_start": { type: Number, label:"Number of reads starting at this position across all samples", optional:true },
//              "reads_at_stop": { type: Number, label:"Number of reads stopping at this position across all samples", optional:true },
//              "variant_type": { type: String, label:"Variant type, can be SNP, INS or DEL", optional:true },
//              "effects": { type: [Object], label:"Predicted effects Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_change| Amino_Acid_length | Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon  | GenotypeNum [ | ERRORS | WARNINGS ] )" , optional:true }
// */
//
//         }
//         /*for (dlist in data.records) {
//             for (d in dlist) {
//               console.log('#vcf data:',dlist.d);
//             }
//         }*/
//         //console.log('data.records[0]',data.records[0]);
//         //var dx = data.records[1];
//         //console.log('data.records[1]',typeof data.records[1],Object.keys(data.records[1]),data.records[1]);
//               console.log('done mut=',mut,'\n');
//
//       }
//
// //
//   //    vcf.parser()(chunk);
//      });
//   console.log("stored file");
// });
