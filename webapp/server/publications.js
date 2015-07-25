Meteor.publish("uploaded_files", function(){
  return UploadedFiles.find({  });
});
