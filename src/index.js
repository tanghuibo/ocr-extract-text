const businessService = require("./businessService");

(async () => {
  await businessService.ocrAllFile();
  await businessService.retryOrc(3);
  businessService.proccessDataAndWriteToExcel();
})();
