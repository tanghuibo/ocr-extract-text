# OCR 文本识别

## 启动

### 1. 配置秘钥

将 `/src/configDemo.js` 重命名为 `/src/config.js`，并补全秘钥信息，秘钥[获取](https://console.bce.baidu.com/ai/?_=1657100782055&fromai=1#/ai/ocr/app/list)

```json
{
     "clientId": "xxxx",
    "clientSecret": "xxxx"
}
```

### 2. 将要识别的图片放入 `input` 文件夹

与 `src` 文件夹同级，没有则手动创建一个

### 3. 在 `src` 同级目录下运行命令

```bash
npm run start
```

### 4. 从 `output` 文件夹中获取生成好的 excel 文件
