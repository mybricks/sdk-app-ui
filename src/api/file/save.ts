import { getAxiosInstance, getMessageFromAxiosErrorException } from '../util'

/**
 * 保存
 *
 * @param {{userId: any, fileId: any, shareType?: any, name?: any, content: any, icon?: any, namespace?: any, type?: any}} params
 * @returns {Promise<{}>}
 */
function save(params: {userId: any, fileId: any, shareType?: any, name?: any, content: any, icon?: any, namespace?: any, type?: any}): Promise<{}> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if(params?.isEncode && params?.content) {
      console.log('开启压缩')
      params.content = btoa(encodeURIComponent(params?.content))
      // params.content = encodeURI(params?.content.replace(/\./g, '#D#').replace(/\,/g, '#DH#').replace(/\;/g, '#FH#').replace(/\(/g, '#ZKH#').replace(/\)/g, '#YKH#').replace(/\:/g, '#MH#').replace(/\'/g, '#DYH#'))
    }
    getAxiosInstance()
    .post('/paas/api/workspace/saveFile', params)
    .then(({data}: any) => {
      if (data?.code === 1) {
        resolve(data?.data);
      } else {
        reject(new Error(`${data?.stack || data?.message || '保存失败，未知错误'}`))
      }
    }).catch((e: any) => {
      reject(new Error(getMessageFromAxiosErrorException(e, '保存失败')))
    })
  });
}

export default save;
