var spawnProcess = Npm.require('child_process').spawn; // creates child process
var PassThrough = Npm.require('stream').PassThrough; // for piping around
var tempDirs = Meteor.npmRequire('temp').track(); // creates temp working dirs
var path = Npm.require('path');
var fs = Npm.require('fs'); // deal with the file system

function runShell (command, args, workingDir, callback) {
  
  // create some output files
  var outputFile = new FS.File();
	outputFile.name('runShell_stdout.txt');
	outputFile.type('text/plain');
	outputFile.size(200);
  // create some output files
  var errorFile = new FS.File();
	errorFile.name('runShell_stderr.txt');
	errorFile.type('text/plain');
	errorFile.size(200);
  // TODO: set metadata for command, args

  // link up the PassThroughs
  var outputPassThrough = new PassThrough();
  var errorPassThrough = new PassThrough();

  // set them up with the PassThroughs
  outputFile.createReadStream = function() {
      return outputPassThrough;
  };
  errorFile.createReadStream = function() {
      return errorPassThrough;
  };

  // spawn our process
  var shlurp = spawnProcess(command, args, { cwd: workingDir });

  shlurp.stdout.pipe(outputPassThrough);
  shlurp.stderr.pipe(errorPassThrough);

  shlurp.on('error', function(error) {
    console.log('error running command ', error);
  });
  shlurp.on('close', Meteor.bindEnvironment(function(returnCode) {
    // debugger;
    console.log('process ended with code ' + returnCode);
    callback(returnCode);
  }));

  var outputObject = {
    'stdout': Blobs.insert(outputFile),
    'stderr': Blobs.insert(errorFile),
  };

  return outputObject;
}


uncompressTarGz = function(fileObject, documentInsert, onError) {

  var workingDir = tempDirs.mkdirSync('uncompressTarGz');
  var fileName = fileObject.original.name;

  var readStream = fileObject.createReadStream('blobs');
  var writeStream = fs.createWriteStream(path.join(workingDir, fileName));

  readStream.on("data", function (chunk) {
    writeStream.write(chunk);
  });
  readStream.on("end", Meteor.bindEnvironment(function () {
    // successfully wrote whole file
    console.log("wrote the whole file :)");
    debugger;

    // uncompress the file
    var outputObject;
    outputObject = runShell("tar", ["-zxvf", fileName], workingDir,
        function (returnCode, output) {
      // read all the files back in
      debugger;

      console.log("outputObject:", outputObject);
    });

    console.log("outputObject:", outputObject);
    console.log("after runShell line");
    debugger;
  }));
};
