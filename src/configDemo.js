const path = require('path');
module.exports = {
    clientId: 'xxxx',
    clientSecret: 'xxxx',
    inputDir: path.join(__dirname, '..', 'input'),
    outputDir: path.join(__dirname, '..', 'output'),
    outputName: "result.xlsx",
    excelHeaderList: [{
        key: 'companyName',
        name: "公司名称",
      },{
        key: 'contacts',
        name: "联系人",
      },{
        key: 'phoneNumber',
        name: "电话",
      },{
        key: 'filePath',
        name: "文件路径",
      }]
}