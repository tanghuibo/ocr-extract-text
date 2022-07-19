const gaodeService = require("./gaodeService");
const service = require("./service");
module.exports = {
  proccessDataAndWriteToExcel() {
    const ocrResultList = gaodeService
      .readOcrResult()
      .filter((item) => item.wordList != null && item.wordList.length > 0);

    let extractResultList = ocrResultList.map((ocrResult) => ({
      ...gaodeService.extractData(ocrResult.wordList),
      filePath: ocrResult.filePath,
    }));

    const excelList = extractResultList
      .flatMap((extractResult) =>
        extractResult.phoneNumberList.map((phoneNumber) => ({
          phoneNumber,
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
            companyName: "",
            filePath: item.filePath,
            error: item.error,
          }))
      );
    service.writeXlsx(excelList);
  },
};
