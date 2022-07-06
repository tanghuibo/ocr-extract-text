const fs = require('fs');
const nodeXlsx = require('node-xlsx');
module.exports = {
  toExcelFile(dataList, headerList, outputFilePath) {


    const bytes = nodeXlsx.build([{
      name: "sheet1",
      data: [
        headerList.map(item => item.name),
        ...dataList.map(data => headerList.map(header => data[header.key]))
      ]
    }]);


    fs.writeFileSync(outputFilePath, bytes);

  }
}