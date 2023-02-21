import axios from "axios";

const saveSetting = async (namespace: string, config: any, email) => {
  return new Promise((resolve, reject) => {
    if(!email) {
      reject('请传入email')
    }
    axios({
      method: "post",
      url: "/paas/api/config/update",
      data: {
        namespace: namespace,
        userId: email,
        config,
      },
    }).then(({ data }) => {
      const { code } = data ?? {};
      if (code === 1) {
        resolve(true)
      } else {
        reject('保存系统设置失败')
      }
    });
  })


}

export default saveSetting
