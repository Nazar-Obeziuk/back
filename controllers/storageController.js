const path = require("path");
const os = require("os");
const fs = require("fs");
const bucket = require("../config/firebaseConfig");

async function uploadFile(folder, name, fileBuffer, fileType) {
  const filePath = `${folder}/${name}`;
  let url = "";

  if (fileBuffer) {
    try {
      const tempFilePath = path.join(os.tmpdir(), name);
      fs.writeFileSync(tempFilePath, fileBuffer);

      await bucket.upload(tempFilePath, {
        destination: filePath,
        metadata: {
          contentType: fileType,
        },
      });

      const file = bucket.file(filePath);
      url = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      fs.unlinkSync(tempFilePath); // Видаляємо тимчасовий файл
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log("Wrong format of file");
  }

  return url[0];
}

module.exports = {
  uploadFile,
};
