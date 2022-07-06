const service = require("./service");
const taskCount = 5;

(async () => {
  const resultList = [];
  const taskList = [];
  const fileList = service.getFileList();
  await service.init();

  for (let i = 0; i < taskCount; i++) {
    taskList.push((async () => {
      let fileItem = fileList.shift();
      while (fileItem != null) {
        const result = await service.ocr(fileItem.path);
        let { phoneNumber, companyName, contacts } = result;
        if (phoneNumber == null) {
          console.error(fileItem.fileName, "缺少电话号码");
        }
        if (companyName == null) {
          console.error(fileItem.fileName, "缺少公司名称");
        }
        if (contacts == null) {
          console.error(fileItem.fileName, "缺少联系人名称");
        }
        console.log(fileItem.fileName, JSON.stringify(result));
        resultList.push({ ...result, filePath: fileItem.path });
        fileItem = fileList.shift();
      }
    })());
  }

  await Promise.all(taskList);

  service.writeXlsx(resultList);
})();
