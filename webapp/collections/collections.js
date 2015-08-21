// TODO: write a cron job to go through and delete old ones of these
  WranglerSubmissions = new Meteor.Collection("wrangler_submissions");
WranglerSubmissions.attachSchema(new SimpleSchema({
  "user_id": { type: Meteor.ObjectID },
  "type": {
    type: String,
    allowedValues: [
      "pathway"
    ],
  },
  "files": {
    type: [
      new SimpleSchema({
        "file_id": { type: Meteor.ObjectID },
        "file_name": { type: String },
      })
    ],
    optional: true
  },
}));

UploadedFileStore = new FS.Store.GridFS("uploaded_files", {
  beforeWrite: function (fileObject) {
    // this.userId because we're on the server (doesn't work)
    fileObject.uploaded_date = new Date();
  }
});

UploadedFileStore.on("stored", function (storeName, fileObject) {
  if (storeName !== UploadedFileStore.name) return; // workaround for known bug
  var assert = Meteor.npmRequire("assert");
  var fs = Meteor.npmRequire("fs");
  // var byLine = Meteor.npmRequire('byLine');
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
        //data = vcf.parser()(String(fs.readFileSync('/data/MedBook/MedBook-Wrangler/webapp/test.vcf')));
        for (h in data.header) {
            console.log('#vcf header:',h);
        }
        //console.log('#DR',  data.records);
        var len = data.records.length;
        console.log('len',len);
        var mut = {};
        for (var i = 0; i < len; i++) {
             var dx = data.records[i];
             var keys = Object.keys(dx);

             console.log('keys',keys, dx);
             mut.gene_id = 'none';
             mut['gene_label'] = 'WIERD';
             for (k in keys) {
               var key = keys[k];
               var mapped_key = key;
               if (key == 'TYPE') {
                   mapped_key = 'mutation_type';
               }
               mut[mapped_key] = dx[key];
               console.log('dx [',mapped_key,']=',dx[key]);
             }
             Mutations.insert(mut);
             /*
             "gene_label": { type: String },
             "gene_id": { type: String },
             "protein_change": { type: String, optional: true },
             "mutation_type": { type: String }, // variant_classification for us
             "chromosome": { type: String },
             "start_position": { type: Number },
             "end_position": { type: Number },
             "reference_allele": { type: String },
             "variant_allele": { type: String },
             "MA_FImpact": { type: String, optional: true },
             "MA_FIS": { type: Number, optional: true },
             "allele_count": { type: Number, label:"Allele count in genotypes, for each ALT allele, in the same order as listed", optional:true },
             "allele_frequency": { type: Number, decimal:true, label:"Allele frequency, for each ALT allele, in the same order as listed", optional:true },
             "allele_number": { type: Number, label:"Number of unique alleles across all samples", optional:true },
             "base_quality": { type: Number, decimal:true, label:"Overall average base quality", optional:true },
             "read_depth": { type: Number, label:"Total read depth for all samples", optional:true },
             "fraction_alt": { type: Number, decimal:true, label:"Overall fraction of reads supporting ALT", optional:true },
             "indel_number": { type: Number, label:"Number of indels for all samples", optional:true },
             "modification_base_changes": { type: String, label:"Modification base changes at this position", optional:true },
             "modification_types": { type: String, label:"Modification types at this position", optional:true },
             "sample_number": { type: Number, label:"Number of samples with data", optional:true },
             "origin": { type: String, label:"Where the call originated from, the tumor DNA, RNA, or both", optional:true },
             "strand_bias": { type: Number, decimal:true, label:"Overall strand bias", optional:true },
             "somatic": { type: Boolean, label:"Indicates if record is a somatic mutation", optional:true },
             "variant_status": { type: Number, label:"Variant status relative to non-adjacent Normal, 0=wildtype,1=germline,2=somatic,3=LOH,4=unknown,5=rnaEditing" , optional:true},
             "reads_at_start": { type: Number, label:"Number of reads starting at this position across all samples", optional:true },
             "reads_at_stop": { type: Number, label:"Number of reads stopping at this position across all samples", optional:true },
             "variant_type": { type: String, label:"Variant type, can be SNP, INS or DEL", optional:true },
             "effects": { type: [Object], label:"Predicted effects Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_change| Amino_Acid_length | Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon  | GenotypeNum [ | ERRORS | WARNINGS ] )" , optional:true }
*/

        }
        /*for (dlist in data.records) {
            for (d in dlist) {
              console.log('#vcf data:',dlist.d);
            }
        }*/
        //console.log('data.records[0]',data.records[0]);
        //var dx = data.records[1];
        //console.log('data.records[1]',typeof data.records[1],Object.keys(data.records[1]),data.records[1]);
              console.log('done mut=',mut,'\n');

      }

//
  //    vcf.parser()(chunk);
     });
  console.log("stored file");
});

UploadedFiles = new FS.Collection("uploaded_files", {
  stores: [UploadedFileStore],
});

// users can only modify their own documents
UploadedFiles.allow({
  insert: function (userId, doc) {
    console.log("UploadedFiles.allow insert");
    return userId === doc.user_id;
  },
  update: function(userId, doc, fields, modifier) {
    console.log("UploadedFiles.allow update:", fields, modifier);
    return userId === doc.user_id;
  },
  remove: function (userId, doc) {
    console.log("UploadedFiles.allow remove");
    return userId === doc.user_id;
  },
  download: function (userId, doc) {
    console.log("UploadedFiles.allow download");
    return userId === doc.user_id;
  }
});
