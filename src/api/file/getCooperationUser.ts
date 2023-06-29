import { getAxiosInstance } from '../util'

const getCooperationUser = ({email, groupId, fileId}: {email: string, groupId?: number, fileId?: number}) => {
  return new Promise((resolve, reject) => {
    if (!groupId && !fileId) {
      reject('协作组id和文件id至少需要有一个有效值')
    } else if (!email) {
      reject('用户邮箱不能为空')
    } else {
      if (groupId) {
        getAxiosInstance()
          .get(`/paas/api/userGroup/getUser?email=${email}&id=${groupId}`)
          .then(({ data }: any) => {
            if (data.code === 1) {
              resolve(data.data)
            } else {
              reject('获取协作用户信息失败')
            }
          }).catch((e: any) => {
            reject(`获取协作用户信息失败:${e.msg || e.message}`)
          });
      } else {
        getAxiosInstance()
          .get(`/paas/api/userFile/getUser?email=${email}&id=${fileId}`)
          .then(({ data }: any) => {
            if (data.code === 1) {
              resolve(data.data)
            } else {
              reject('获取协作用户信息失败')
            }
          }).catch((e: any) => {
            reject(`获取协作用户信息失败:${e.msg || e.message}`)
          });
      }
    }
  })
}

export default getCooperationUser