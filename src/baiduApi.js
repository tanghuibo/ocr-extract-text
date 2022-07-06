const axios = require('axios');
const qs = require('qs');
const config = require('./configDemo');


module.exports = {
    getToken() {
        return axios.get('https://aip.baidubce.com/oauth/2.0/token', {
            params: {
                grant_type:'client_credentials',
                client_id: config.clientId,
                client_secret: config.clientSecret,
            }
        }).then(res => res.data.access_token);
    },
    ocr(base64Image, token) {
        return axios({
            method: 'post',
            url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
            params: {
                access_token: token,
            },
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : qs.stringify({
              'image': base64Image
             })
          }).then(res => res.data)
    }

}