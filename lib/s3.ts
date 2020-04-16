import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const S3_CONFIG = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_PW: process.env.AWS_ACCESS_KEY_PASSWORD,
  AWS_REGION: process.env.AWS_REGION
};

const s3 = new AWS.S3({
  accessKeyId: S3_CONFIG.AWS_ACCESS_KEY_ID,
  secretAccessKey: S3_CONFIG.AWS_ACCESS_KEY_PW,
  region: S3_CONFIG.AWS_REGION
});

export default s3;
