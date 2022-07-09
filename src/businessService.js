const service = require("./service");
const config = require("./config");
module.exports = {
  async ocrAllFile() {
    const resultList = [];
    const taskList = [];
    const fileList = service.getFileList();
    console.log("开始识别图片，图片数量: " + fileList.length);
    await service.init();
    for (let i = 0; i < config.ocrCurrentTaskCount; i++) {
      taskList.push(
        (async () => {
          let fileItem = fileList.shift();
          while (fileItem != null) {
            console.log("识别图片: " + fileItem.path);
            try {
              const wordList = await service.ocr(fileItem.path);
              resultList.push({ wordList, filePath: fileItem.path });
            } catch (e) {
              console.error("识别出错", fileItem.path, e);
              resultList.push({ error: e.message, filePath: fileItem.path });
            }
            fileItem = fileList.shift();
          }
        })()
      );
    }
    await Promise.all(taskList);
    console.log("图片识别结束");
    service.writeOcrResult(resultList);
  },

  async retryOrc(time) {
    const resultList = service.readOcrResult();
    const failedResultList = resultList.filter((item) => item.error != null);
    if (failedResultList.length === 0) {
      return;
    }

    const taskList = [];

    console.log("开始重试识别图片，图片数量: " + failedResultList.length);

    await service.init();

    for (let i = 0; i < config.ocrCurrentTaskCount; i++) {
      taskList.push(
        (async () => {
          let failedResult = failedResultList.shift();
          while (failedResult != null) {
            console.log("识别图片: " + failedResult.filePath);
            try {
              const wordList = await service.ocr(failedResult.filePath);
              delete failedResult.error;
              failedResult.wordList = wordList;
            } catch (e) {
              console.error("识别出错", failedResult.filePath, e);
            }
            failedResult = failedResultList.shift();
          }
        })()
      );
    }

    await Promise.all(taskList);
    console.log("图片识别结束");
    service.writeOcrResult(resultList);
    if (time === 0) {
      return;
    }
    await this.retryOrc(time - 1);
  },

  proccessDataAndWriteToExcel() {
    const ocrResultList = service
      .readOcrResult()
      .filter((item) => item.wordList != null && item.wordList.length > 0);

    let extractResultList = ocrResultList.map((ocrResult) => ({
      ...service.extractData(ocrResult.wordList),
      filePath: ocrResult.filePath,
    }));

    const contactsMap = extractResultList.reduce((cur, next) => {
      const name = next.companyName;
      if(name == null || name == '') {
        return cur;
      }
      const phoneNumberLength = next.phoneNumberList.length;
      const contacts = next.contacts;
      const data = cur[name];
      if (data == null || data.phoneNumberLength > phoneNumberLength) {
        cur[name] = {
          contacts,
          phoneNumberLength,
        };
      }
      return cur;
    }, {});

    const excelList = extractResultList
      .flatMap((extractResult) =>
        extractResult.phoneNumberList.map((phoneNumber) => ({
          phoneNumber,
          contacts:
            contactsMap[extractResult.companyName]?.contacts ||
            extractResult.contacts,
          companyName: extractResult.companyName,
          filePath: extractResult.filePath,
          error: "",
        }))
      )
      .concat(
        service
          .readOcrResult()
          .filter((item) => item.error != null)
          .map((item) => ({
            phoneNumber: "",
            contacts: "",
            companyName: "",
            filePath: item.filePath,
            error: item.error,
          }))
      );
    service.writeXlsx(excelList);
  },
};
