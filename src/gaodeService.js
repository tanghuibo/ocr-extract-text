const fs = require("fs");
const path = require("path");
const config = require("./config");
const excelUtils = require("./excelUtils");

const phoneReg = /(1[0-9]{10})|([0-9]{3,4})?[0-9]{7,8}|[0-9]{3,4}-[0-9]{7,8}/g;

module.exports = {

  extractData(wordList) {
    const text = wordList.join(" ");
    const result = {};
    result.phoneNumberList = text.match(phoneReg).filter(item => item.length === 11);
    wordList.shift();
    result.companyName = wordList.find(word => word.length > 2 && !(word.includes("相似") || word.includes("：") || word.includes("反馈")));
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
    const distinctDataList = [];
    const phoneNumberSet = new Set();
    for(let data of dataList) {
      if(phoneNumberSet.has(data.phoneNumber)) {
        continue;
      }
      phoneNumberSet.add(data.phoneNumber);
      distinctDataList.push(data);
    }
    const outPath = path.join(config.outputDir, config.outputName);
    excelUtils.toExcelFile(distinctDataList, config.excelHeaderList, outPath);
    console.log("文件地址", outPath);
  },
};
