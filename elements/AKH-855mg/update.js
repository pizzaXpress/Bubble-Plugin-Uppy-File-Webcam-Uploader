function(instance, properties, context){
// run initialization function
if (instance.data.init_complete != true){
    setTimeout(init, 100);
    instance.data.init_complete = true;
}

    
function init(){
    let p = properties;
    let b = properties.bubble;
    let maxFileSize;
    let minNumberOfFiles = p.min_number_of_files || 1;
    let maxNumberOfFiles = p.max_number_of_files;
    let autoProceed = p.auto_proceed;
    let allowMultipleUploads = p.allow_multiple_uploads;
    instance.data.allFileURLs = [];
    
    if (p.max_file_size > 50){
        maxFileSize = 5242880;
    }
    else{
        maxFileSize = p.max_file_size * 1048576;
    }
    let allowedFileTypes = p.allowed_file_types;
    if( allowedFileTypes != null){
        allowedFileTypes = allowedFileTypes.split(',');
    }
    let uppyDashboardSettings = { 
          target: `#${instance.data.divName}`,
          inline: true ,
          id : instance.data.divName,
          width: b.width,
          height: b.height,
          showProgressDetails: p.show_progress_details,
          hideProgressAfterFinish: p.hide_progress_after_finish,
          disableStatusBar: p.disable_status_bar,
          disableInformer: p.disable_informer,
          disableThumbnailGenerator: p.disable_thumbnail_generator,
          proudlyDisplayPoweredByUppy: false,
          hideUploadButton: true,
          hideRetryButton: true,
          hidePauseResumeButton: true,
          hideCancelButton: true
    };
    let uppyGeneralSettings = {
        restrictions: {
              maxFileSize: maxFileSize,
              maxNumberOfFiles: maxNumberOfFiles,
              minNumberOfFiles: minNumberOfFiles,
              allowedFileTypes: allowedFileTypes
          },
        allowMultipleUploads: allowMultipleUploads,
        autoProceed : autoProceed,
        debug : properties.debug_mode,
        onBeforeFileAdded : (file) => {return file},
        onBeforeUpload : (files) => { return files}
        
    };
  
    let uppy = Uppy.Core(uppyGeneralSettings)
                  .use(Uppy.Dashboard, uppyDashboardSettings);

    if (properties.use_webcam === true){
          let webcamModes = [];
          if (p.webcam_video_only == true){
              webcamModes.push('video-only');
          }
          if (p.webcam_video_audio == true){
              webcamModes.push('video-audio');
          }
          if (p.webcam_audio_only == true){
              webcamModes.push('audio-only');
          }
          if (p.webcam_picture == true){
              webcamModes.push('picture');
          }
        
          let webcamSettings = {
              mirror: p.webcam_mirror,
              facingMode: p.webcam_facing_mode,
              showRecordingLength: p.webcam_show_recording_length,
              target : Uppy.Dashboard,
              onBeforeSnapshot: () => Promise.resolve(),
              countdown: p.webcam_countdown,
              modes: webcamModes,
              locale: {},
          };
   
    uppy.use(Uppy.Webcam, webcamSettings);
    
    
}  
    
    
/*uppy.use(Transloadit, { 
  params: {
      auth: {
          key: 'ecae5c5b53244834838abb7d0c0bb26f'
      }
  },
  waitForEncoding: false,
  waitForMetadata: false,
  importFromUploadURLs: false,
  alwaysRunAssembly: false,
  signature: null,
  fields: {},
  limit: 0
});

uppy.use(Uppy.Instagram, {
        target: Uppy.Dashboard,
  		companionUrl: `https://api2-us-east-1.transloadit.com/companion`
});
    
   */
    

    
instance.data.fileDone = function (err, url){
      let file = instance.data.file;

      if (err != undefined) {
          console.log('error', err);
          return
      }
      if(instance.data.fileCount < instance.data.fileList.length){
        instance.data.allFileURLs.push(url);
        instance.publishState('current_file_url', url);
        instance.publishState('all_file_urls', instance.data.allFileURLs);

        instance.data.publishFileStates(file);
        instance.data.setUppy(file);
        setTimeout(instance.triggerEvent('file_upload_complete'), 150);

        instance.data.fileCount++;
        instance.data.sendFile();
        
        
      }
      if(instance.data.fileCount === instance.data.fileList.length ){
        instance.triggerEvent('upload_session_complete');
        return
      }


  }

// Convert file to base64 string
instance.data.fileToBase64 = (file) => {
  return new Promise(resolve => {
    var reader = new FileReader();
    // Read file content on file loaded event
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    
    // Convert data to base64 
    reader.readAsDataURL(file);
      
  });
};


instance.data.uppy = uppy;
uppy.on('cancel-all',() => {
     instance.data.fileCount = 0; 
     instance.data.allFileURLs = [];

});

uppy.on('file-added', (file) => {
        instance.data.publishFileStates(file);
        instance.triggerEvent('file_added')
});
  
uppy.on('file-removed',(file) => {
        instance.data.publishFileStates(file);
        instance.triggerEvent('file_removed');
});

instance.data.sendFile = function (){

    let fileList = instance.data.fileList;
    let fileCount = instance.data.fileCount; 
    
    if (fileCount < fileList.length){

      //set the persistent variable to the current file
      instance.data.file = fileList[fileCount];
      let file = instance.data.file;
      instance.data.publishFileStates(file);
      instance.triggerEvent('file_upload_ready');
      setTimeout(instance.data.fileUpload(file), 150);
      return
     }
    else {
       return  
    }
}
instance.data.fileUpload = (file) =>{
  instance.data.fileToBase64(file.data).then(result => {
        let attachToThing = p.attach_to_thing || null;
         context.uploadContent(file.name, result.split(',')[result.split(',').length - 1], instance.data.fileDone, attachToThing );;
      });
}
    //logging function
function log(err){
        if (err != undefined){
            console.log(err);
        }
    }
instance.data.publishFileStates = (file) => {
    	let count = 0;
        let files = uppy.getFiles();
        if (files.length != undefined || files.length != 0) files.forEach( _=> count++ );
        instance.publishState('current_file_name', file.name);
        instance.publishState('current_file_type', file.type);
        instance.publishState('current_file_extension',file.extension); 
        instance.publishState('current_file_size', file.size);
    	instance.publishState('number_of_files', count );
}
      
instance.data.setUppy = function (file){
        //uppy.setState({files[file.idprogress.percentage = percentComplete
      // Upload in progress. Do something here with the percent complete.

      // We use Object.assign({}, obj) to create a copy of `obj`.
      const updatedFiles = Object.assign({}, uppy.getState().files);
      // We use Object.assign({}, obj, update) to create an altered copy of `obj`.

      const updatedFile = Object.assign({}, updatedFiles[file.id], {
          progress: Object.assign({}, updatedFiles[file.id].progress, {
          uploadComplete : true
        })
      });
      updatedFiles[file.id] = updatedFile;
      uppy.setState({files: updatedFiles});
      return
    }

}
    
}