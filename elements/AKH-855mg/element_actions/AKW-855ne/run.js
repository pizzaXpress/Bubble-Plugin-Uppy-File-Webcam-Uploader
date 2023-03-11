function(instance, properties, context) {


  //Load any data 

var uppy = instance.data.uppy;
let count = 0;    
instance.data.fileCount = 0;
instance.data.allFileURLs = [];
  
let fileList = uppy.getFiles();
for (let i = 0 ; i < fileList.length ; i ++){
    
    if ( fileList[i].progress.uploadComplete == true ){
        count++

    }
}
instance.data.fileCount = count;
instance.data.fileList = fileList;
instance.data.sendFile(); 
  //Do the operation



}