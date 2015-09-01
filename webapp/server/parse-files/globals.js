// makes it easy to read a file line by line:
// calls callWithLine with each successive line of the file
lineByLineStream = function(fileObject, callWithLine) {
  var byLine = Meteor.npmRequire('byline');
  var stream = byLine(fileObject.createReadStream("blobs"))
    .on('data', Meteor.bindEnvironment(function (lineObject) {
      var line = lineObject.toString();
      callWithLine(line);
    }));
}
/*
boxplot_adapter: function (argList) {
			console.log('user', this.userId)
			console.log('boxplot adapter',argList)
			read_config()
			var contrastId = argList[0]
			var sampleList =  {'_id':0}
			var sampleList2 =  {'_id':0}
			var gene = argList[1]
			workDir = ntemp.mkdirSync('boxplotWork')
			var phenofile =path.join(workDir, 'pheno.tab')
			var contrast = Contrast.findOne({'_id':contrastId},{list1:1,'name':1,'studyID':1,_id:0});
			try {
				var contrastName = contrast['name']
			}
			catch(error) {
				console.log('No contrast found for ', argList, " error is ", error)
				return -1
			}
			var studyID = contrast['studyID']
			var wstream = fs.createWriteStream(phenofile)
			wstream.write( "sample\tgroup\n")
			console.log('# of samples in each side of' , contrast['name'],': ' , contrast['list1'].length, 'vs',contrast['list2'].length)
			_.each(contrast['list1'], function(item) {
				wstream.write(item)
				sampleList['samples.'+item] = 1
				sampleList2[item] = 1
				wstream.write('\t')
				wstream.write(contrast['group1'])
				wstream.write( '\n')
			})
			_.each(contrast['list2'], function(item) {
				wstream.write(item)
				sampleList['samples.'+item] = 1
				sampleList2[item] = 1
				wstream.write('\t')
				wstream.write(contrast['group2'])
				wstream.write( '\n')
			})
			wstream.end()
			var expfile =path.join(workDir, 'expdata.tab')

			console.log('sample list length from study', studyID , Object.keys(sampleList).length )
			var exp_curs = Expression2.find({'gene':{$in:gene}, 'Study_ID':studyID}, sampleList);
			//var exp_curs = Expression.find({}, sampleList);
			var fd = fs.openSync(expfile,'w');
			fs.writeSync(fd,'gene\t')
			_.map(sampleList2, function(value, key) {
				if (value == 1) {
					fs.writeSync(fd,key)
					fs.writeSync(fd,'\t')
				}
			})
			fs.writeSync(fd,'\n')
			console.log('exp count' , exp_curs.count())

			exp_curs.forEach(function(exp) {
				console.log('exp',exp)
				fs.writeSync(fd,exp['gene'])
				fs.writeSync(fd,'\t')
				var expr = exp['samples']
				var scaling = 'rsem_quan_log2'
				_.map(sampleList2, function(value, key) {

					if (value == 1) {
						geneExp = expr[key][scaling]
						fs.writeSync(fd,geneExp+'')
						fs.writeSync(fd,'\t')
					}
				})
				fs.writeSync(fd,'\n')
			})
			fs.closeSync(fd)
			fs.exists(expfile, function(data) {
				console.log('file',	 expfile, 'exists?', data )
			})

			var cmd = medbook_config.tools.boxplot.path;
			var whendone = function(retcode, workDir, contrastId, contrastName, studyID, uid) {
				var idList = [];
				console.log('whendone work dir', workDir, 'return code', retcode, 'user id', uid)
				var buf = fs.readFileSync(path.join(workDir,'report.list'), {encoding:'utf8'}).split('\n')
				_.each(buf, function(item) {
					if (item) {
						var opts = {};
						ext = path.extname(item).toString();
						filename = path.basename(item).toString();
						if (ext == '.xgmml')
							opts.type = 'text/xgmml'
						else if (ext == '.sif')
							opts.type = 'text/network'
						else if (ext == '.tab')
							opts.type = 'text/tab-separated-values'
						else
							opts.type = mime.lookup(item)

						var f = new FS.File();
						f.attachData(item, opts);

						var blob = Blobs.insert(f);
						console.log('name', f.name(),'blob id', blob._id, 'ext' , ext, 'type', opts.type, 'opts', opts, 'size', f.size());
						idList.push(blob._id);
					}
				})
				console.log('insert list of blobs', idList);
				var resObj = Results.insert({'contrast': contrastId,'type': 'boxplot', 'name':'boxplot for '+contrastName,'studyID':studyID,'return':retcode, 'blobs':idList});
			};
		    Meteor.call('runshell', cmd, [expfile,phenofile, gene, gene.join('_')+'.pdf', gene.join('_')+'.svg'],
				workDir, contrastId, contrastName, studyID, path.join(workDir,'report.list'), whendone, function(err,response) {
					if(err) {
						console.log('serverDataResponse', "boxplot_adapter :" + err);
						return ;
					}
			resultObj = response['stderr'];
			console.log('limma started stdout stream id: '+resultObj._id+ ' stdout name '+resultObj.name());
			var readstream = resultObj.createReadStream('blobs');
			readstream.setEncoding('utf8');
			readstream.on('data', function(chunk) {
				console.log('chunk', chunk);
			})
		});
			},
*/
