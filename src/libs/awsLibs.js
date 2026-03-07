import { uploadData } from "aws-amplify/storage";

export default async function s3Upload(file) {
  const filename = `${Date.now()}-${file.name}`;

  const result = await uploadData({
    path: filename,
    data: file,
    options: { contentType: file.type, accessLevel: "private" },
  }).result;

  return result.path;
}
