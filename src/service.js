const fs = require("fs");
const path = require("path");
const baiduApi = require("./baiduApi");
const store = require("./store");
const base64Utils = require("./base64Utils");
const config = require("./config");
const excelUtils = require("./excelUtils");

const phoneReg = /(1[0-9]{10})|([0-9]{3,4})?[0-9]{7,8}|[0-9]{3,4}-[0-9]{7,8}/g;
const companyReg = /上海.*?公司/g;

module.exports = {
  getFileList() {
    if (!fs.existsSync(config.inputDir)) {
      console.error("文件夹不存在", config.inputDir);
      return [];
    }
    return fs.readdirSync(config.inputDir).map((fileName) => ({
      fileName,
      path: path.join(config.inputDir, fileName),
    }));
  },
  async init() {
    const token = await baiduApi.getToken();
    store.set("token", token);
  },
  async ocr(filePath) {
    const token = store.get("token");
    const base64Data = base64Utils.fileToBase(filePath);
    const ocrResult = await baiduApi.ocr(base64Data, token);
    const wordList =
      ocrResult?.words_result?.map((item) => item.words.trim()) || [];
    return wordList;
  },
  extractData(wordList) {
    const text = wordList.join(" ");
    const result = {};
    result.phoneNumberList = text.match(phoneReg);
    result.companyName = text.match(companyReg)?.[0];

    if (result.companyName == null || result.companyName === "") {
      const cpBeforeIndex = wordList.findIndex((word) =>
        word.endsWith("公司详情")
      );
      if (cpBeforeIndex >= 0 && cpBeforeIndex < wordList.length - 1) {
        result.companyName = wordList[cpBeforeIndex + 1];
        console.log(
          "获取公司名称失败，备选方案获取到公司名称:" + result.companyName
        );
      }
    }

    const createTimeIdx = wordList.indexOf("成立时间");
    if (createTimeIdx >= 0) {
      result.contacts = wordList[createTimeIdx + 2];
    }
    return result;
  },
  writeOcrResult(resultList) {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir);
    }
    fs.writeFileSync(
      path.join(config.outputDir, config.orcResultName),
      JSON.stringify(resultList)
    );
  },
  readOcrResult() {
    return JSON.parse(
      fs.readFileSync(
        path.join(config.outputDir, config.orcResultName),
        "utf-8"
      )
    );
  },
  writeXlsx(dataList) {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir);
    }
    const outPath = path.join(config.outputDir, config.outputName);
    excelUtils.toExcelFile(dataList, config.excelHeaderList, outPath);
    console.log("文件地址", outPath);
  },
};
