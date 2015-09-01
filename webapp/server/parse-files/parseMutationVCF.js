function setHighLevel(highLevelObject, key, newValue) {
  if (highLevelObject[key] === undefined) {
    highLevelObject[key] = newValue;
  } else {
    // only complain if not the same
    if (highLevelObject[key] !== newValue) {
      // specifically for effect_impact: MODIFIER mixes with LOW
      if (key === "effect_impact") {
        if (newValue === "MODIFIER") {
          // don't do anything for right now...
        } else if (highLevelObject[key] === "MODIFIER") {
          highLevelObject[key] = newValue;
        } else {
          if (newValue === "HIGH" ||
              (newValue === "MODERATE" && highLevelObject[key] === "LOW")) {
            highLevelObject[key] = newValue;
          } else {
            console.log("two different values for effect_impact in same mutationDoc, even with the LOW/MODIFIER code:",
                highLevelObject[key], newValue);
          }
        }
      } else {
        console.log("two different values for " + key + " in same mutationDoc:",
            highLevelObject[key], newValue, "(using second)");
        highLevelObject[key] = newValue;
      }
    }
  }
}

function wrangleSampleNumber(disgustingName) {
  var firstDashIndex = disgustingName.indexOf("-");
  var secondDashIndex = disgustingName.indexOf("-", firstDashIndex + 1);
  var dashIndex = secondDashIndex === -1 ? firstDashIndex : secondDashIndex;
  var threeCharNumber = disgustingName.substr(dashIndex + 1, 3);

  // make sure it's not just two digits long
  if (isNaN(parseInt(threeCharNumber.substr(2, 1), 10))) {
    return "0" + threeCharNumber.substr(0, 2);
  } else {
    return threeCharNumber;
  }
}

function isProgression(disgustingName) {
  return disgustingName.toLowerCase().indexOf("pro") > -1;
}

parseMutationVCF = function (fileObject, documentInsert, onError) {
  var vcf = Meteor.npmRequire('vcf.js');
  var blob = "";
  var stream = fileObject.createReadStream("blobs")
  .on('data', function (chunk) {
    blob += chunk;
  })
  .on('end', Meteor.bindEnvironment(function () {
    var data = vcf.parser()(blob);

    // TODO: pull from the sampleNames in the header
    // var possibleSampleLabel = record.__HEADER__.sampleNames[0];
    // if (possibleSampleLabel !== "ion-sample") {
    //   console.log("possibleSampleLabel:", possibleSampleLabel);
    //   mutationDoc.sample_label = possibleSampleLabel;
    // } else {
    //
    // }

    var sampleLabel = "DTB-" +
        wrangleSampleNumber(fileObject.original.name);
    if (isProgression(fileObject.original.name)) {
      sampleLabel += "Pro";
    }

    _.mapObject(data.records, function (record) {
      var mutationDoc = {
        "sample_label": sampleLabel,
      };


      var directMappings = {
        "REF": "reference_allele",
        "ALT": "variant_allele",
        "CHROM": "chromosome",
        "POS": "start_position",
      };

      _.mapObject(record, function (value, key) {
        if (directMappings[key] !== undefined) {
          mutationDoc[directMappings[key]] = value;
        } else {
          if (key === "INFO") {
            _.mapObject(value, function (infoValue, infoKey) {
              if (infoKey === "EFF") {
                var effArray = infoValue.split(",");
                for (var effectIndex in effArray) {
                  // ex. for efffects[effectIndex]
                  // NON_SYNONYMOUS_CODING(MODERATE|MISSENSE|gaC/gaG|D1529E|1620|ALK|protein_coding|CODING|ENST00000389048|29|1)
                  var split = effArray[effectIndex].split("(");
                  var effectDescription = split[0]; // ex. NON_SYNONYMOUS_CODING
                  var effectArray = split[1]
                      .substring(0, split[1].length - 1) // remove trailing ')'
                      .split("|");
                  var effectAttributes = [
                    "Effect_Impact",
                    "Functional_Class",
                    "Codon_Change",
                    "Amino_Acid_change",
                    "Amino_Acid_length",
                    "Gene_Name",
                    "Transcript_BioType",
                    "Gene_Coding",
                    "Transcript_ID",
                    "Exon ",
                    "GenotypeNum",
                    "ERRORS",
                    "WARNINGS",
                  ];
                  var effects = {};
                  // TODO: change to _.mapObject
                  for (var attributeIndex in effectAttributes) {
                    effects[effectAttributes[attributeIndex]] =
                        effectArray[attributeIndex];
                  }

                  setHighLevel(mutationDoc, "gene_label", effects.Gene_Name);
                  setHighLevel(mutationDoc, "effect_impact", effects.Effect_Impact);
                  // console.log("effects:", effects);

                }
              } else if (infoKey === "TYPE") {
                setHighLevel(mutationDoc, "mutation_type", infoValue);
              } else {
                // console.log("unknown key in INFO:", infoKey);
              }
            });
          } else {
            // console.log("unknown attribute:", attribute);
          }
        }
      });

      /*
      ** get things from other places if not set already
      */

      // grab sample_label from file name if needed
      if (mutationDoc.mutation_type === undefined) {
        mutationDoc.mutation_type = "snp";
      }
      if (mutationDoc.start_position !== undefined) {
        // TODO: hardcoded
        mutationDoc.end_position = mutationDoc.start_position + 1;
      }

      // for (var index in keys) {
      //   var key = keys[index];
      //   var mapped_key = key;
      //   // TODO: switch to switch statement
      //   if (key == 'TYPE') {
      //     mapped_key = 'mutation_type';
      //   }
      //   if (key == 'POS') {
      //     mapped_key = 'start_position';
      //     mutationDoc.end_position = record[key] + 1;
      //   }
      //   if (key == 'REF') {
      //     mapped_key = 'reference_allele';
      //   }
      //   // if (key == 'sampleNames') {
      //   //   mapped_key = 'sample_label';
      //   //   var sample_name = record[key][0];
      //   //   record[key] = sample_name;
      //   //   console.log("ERROR: I don't think this code is right");
      //   //   mutationDoc.sample_id = 'none';
      //   // }
      //   if (key == 'INFO') {
      //     mapped_key = 'effects';
      //
      //     effDoc = record[key];
      //     var eff_keys = Object.keys(effDoc);
      //     // console.log('#EFF keys',eff_keys);
      //
      //     var effArray = [];
      //
      //     // TODO: don't make functions within a loop
      //     eff_keys.map(function(k) {
      //       // console.log('#key',k);
      //       if (k == 'TYPE') {
      //         console.log ('#type', effDoc[k]);
      //       }
      //       if (k == 'EFF') {
      //         var effectsArray = effDoc[k];
      //         // console.log ('###EFF', effDoc[k]);
      //         if (effectsArray) {
      //           var anno = effectsArray.split(',');
      //           // console.log('anno length', anno.length);
      //           for (var i = 0 ; i < anno.length ; i++ )
      //           {
      //             var a= anno[i];
      //             var firstWord = a.replace(/\(.*/,"");
      //             a = a.replace(/.*\(/,"");
      //             a = a.replace(/\).*/,"");
      //             var values = a.split("|");
      //             // console.log("obtuse", firstWord, values);
      //           }
      //         }
      //       }
      //     });
      //   }
      //   if (mapped_key != '__HEADER__') {
      //     // mutationDoc[mapped_key] = record[key];
      //     // console.log('record [',mapped_key,']=',record[key]);
      //   }
      // }

      // console.log("mutationDoc:", mutationDoc);
      // debugger;
      if (mutationDoc.effect_impact === "LOW" ||
          mutationDoc.gene_label === undefined) {
        // console.log("not adding low impact mutation...");
      } else {
        documentInsert("mutations", mutationDoc);
      }
    });
  })); // end of .on('end')
};
