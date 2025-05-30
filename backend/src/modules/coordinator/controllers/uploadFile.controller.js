const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const FileUpload = require('../models/fileupload.model'); 
const db = require('../../../config/db.config');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (req, res) => {
  // const transaction = await db.sequelize.transaction();
  const { username } = req.user;
  const files = req.files || [req.file]; 
  const { TrainingProgram, programId, existingResources, isNew } = req.body;
  console.log("Files in request:", files);
  console.log(req.body);

  try {
    const listData = await getFilesFromS3ByProgramId(programId);

    const fileMetadata = await FileUpload.findAll({
      where:{
        trainingprogram_id:programId,
      }
    });

    // Ensure listData.Contents is defined before calling map
    let existingFiles = listData.Contents ? listData.Contents.map(item => item.Key) : [];
    existingFiles = existingFiles.map(file=>{
      return file.split('/').pop();
    })
    console.log("Existing files in S3:", existingFiles);

    let filesToDelete = [];
      if(!existingResources) {
        filesToDelete = existingFiles;
      } else {
        filesToDelete = existingFiles.filter(file=>!existingResources.includes(file));
      }
    
    // Delete files from S3 that are not in req.body
    if(filesToDelete.length>0&&!isNew) {
      console.log("Deleting files........");
      const deletePromises = filesToDelete.map(async (file) => {
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `Daas/Training Program materials/${programId}/${file}`,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);

        fileMetadata.filter(data=>data.fileName===file).forEach(async data=>await data.destroy());
      });
  
      await Promise.all(deletePromises);
    }

    // Upload new files and collect their URLs
    const uploadPromises = files.map(async (file) => {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Daas/Training Program materials/${programId}/${file.originalname}`, // Specific structure
        Body: file.buffer,
        Metadata: {
          uploadedBy:username,
          TrainingProgram,
        }
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      fileToUpdate = fileMetadata.find(data=>data.fileName===file.originalname);
      if(fileToUpdate) {
        await fileToUpdate.update({
          fileUrl,
          fileSize: file.size,
          uploadedBy: username,
          trainingProgram: TrainingProgram,
          createdBY: username
        });
      } else {
        await FileUpload.create({
          fileName: file.originalname,
          fileUrl,
          fileSize: file.size,
          uploadedBy: username,
          trainingProgram: TrainingProgram,
          createdDate:new Date(),
          trainingprogram_id: programId,
          createdBY: username, 
        })
      }
    
      return params.Key;
    });

    // await transaction.commit();

    const uploadedFiles = await Promise.all(uploadPromises);
    console.log("Uploaded files:", uploadedFiles);

    let resources = await FileUpload.findAll({
      where:{
        trainingprogram_id:programId,
      },
      attributes:['fileName', 'fileSize', 'uploadedBy', 'fileUrl', 'createdDate']
    });
    resources = resources.map(file => ({
      name: file.fileName,
      url: file.fileUrl,
      size: file.fileSize,
      uploadedBy: file.uploadedBy,
      createdDate: file.createdDate
  }))

    res.status(200).json({ success: true, fileUrls: uploadedFiles.map(fileKey => `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`), resources });
  } catch (error) {
    console.error('Error uploading file:', error);
    // await transaction.rollback();
    res.status(500).send({ success: false, error: 'Failed to upload file' });
  }
};

const getFilesFromS3ByProgramId = async (programId) => {
 // Fetch existing files from S3
 const listParams = {
  Bucket: process.env.S3_BUCKET_NAME,
  Prefix: `Daas/Training Program materials/${programId}/`
};
const listCommand = new ListObjectsV2Command(listParams);
const listData = await s3Client.send(listCommand);
console.log("S3 list data:", listData);

return listData;
}

// const getFileMetadataByProgramId = async (programId) => {
//   await s3Client.hea
// }

const getFilesByProgramId = async (req, res) => {
  const { programId } = req.params;

  try {
    const files = await FileUpload.findAll({
      where: {
        trainingprogram_id: programId
      }
    });
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: error.message
    });
  }
};

const deleteFileByProgramIdAndFileName = async (req, res) => {
  const { programId, fileName } = req.params;

  try {
    // Delete file from S3
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Daas/Training Program materials/${programId}/${fileName}`
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteCommand);

    // Delete file record from the database
    await FileUpload.destroy({
      where: {
        trainingprogram_id: programId,
        fileName: fileName
      }
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  getFilesFromS3ByProgramId,
  getFilesByProgramId,
  deleteFileByProgramIdAndFileName
};