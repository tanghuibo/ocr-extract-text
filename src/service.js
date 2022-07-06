const fs = require('fs');
const path = require('path');
const baiduApi = require('./baiduApi');
const store = require('./store');
const base64Utils = require('./base64Utils');
const config = require('./configDemo');
const excelUtils = require('./excelUtils');


const phoneReg = /(1[0-9]{10})|([0-9]{3,4})?[0-9]{7,8}|[0-9]{3,4}-[0-9]{7,8}/g;
const companyReg = /上海.*?公司/g;

module.exports = {
    getFileList() {
        if(!fs.existsSync(config.inputDir)) {
            console.error("文件夹不存在", config.inputDir);
            return [];
        }
        return fs.readdirSync(config.inputDir).map(fileName => ({
            fileName,
            path: path.join(config.inputDir, fileName)
        }));
    },
    async init() {
        const token = await baiduApi.getToken();
        store.set('token', token);
    },
    async ocr(filePath) {
        const token = store.get("token");
        const base64Data = base64Utils.fileToBase(filePath);
        const ocrResult = await baiduApi.ocr(base64Data, token);
        const wordList = ocrResult?.words_result?.map(item => item.words.trim()) || [];

        const text = wordList.join(' ');
        const result = {};
        result.phoneNumber = text.match(phoneReg)?.[0];
        result.companyName = text.match(companyReg)?.[0];

        const createTimeIdx = wordList.indexOf("成立时间");
        if(createTimeIdx >= 0) {
            result.contacts = wordList[createTimeIdx + 2];
        }
        return result;
    },
    writeXlsx(dataList) {
        if(!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir);
        }
        const outPath = path.join(config.outputDir, config.outputName);
        excelUtils.toExcelFile(dataList, config.excelHeaderList,  outPath);
        console.log("文件地址", outPath);
    }
}