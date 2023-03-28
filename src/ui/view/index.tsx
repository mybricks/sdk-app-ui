import React, {forwardRef, ForwardRefRenderFunction, useImperativeHandle, useLayoutEffect, useMemo, useState} from "react";
import {message} from 'antd';
import { FileContent, ViewProps, ViewRef, IInstalledApp, IConfig, API_CODE } from '../type'
import API from '../../api/index'
import axios from 'axios';
import SDKModal from '../sdkModal/SDKModal';
import {getUrlParam, safeParse} from '../util';
import GlobalContext from '../globalContext';
// @ts-ignore
import css from './css.less'

type T_Props = {
  className?: string;
  onLoad: (props: {
    fileId: number;
    user: any;
    installedApps: any[];
    fileContent: any;
    config: any
    meta: any
    openUrl: (param: any) => any
    projectId: any
    hasMaterialApp: boolean,
  }) => {}
}

const DefaultConfig: IConfig = {
  system: {}
}

export default function View({onLoad, className = ''}: T_Props) {
  const [jsx, setJSX] = useState(<Loading />)
  const [user, setUser] = useState<any>({});
  const [config, setConfig] = useState<IConfig | null>(null);
  const [installedApps, setInstalledApps] = useState([]);
  const [sdkModalInfo, setSDKModalInfo] = useState<any>({});
  const [content, setContent] = useState<FileContent | null>(null);
  const fileId = useMemo(() => Number(getUrlParam('id') ?? '0'), []);
  const appMeta = API.App.getAppMeta();
  const [hierarchy, setHierarchy] = useState(null) // 初始化赋值

  useMemo(() => {
    (async () => {
      try {
        console.log('开始初始化基本数据')
        const loginUser: any = await API.User.getLoginUser()
        setUser({...loginUser, isAdmin: loginUser?.isAdmin});
        const apps: any = await API.App.getInstalledList()
        setInstalledApps(apps);
        const data = await API.File.getFullFile({userId: loginUser?.email, fileId})
        // @ts-ignore
        setContent({...data, content: safeParse(data.content)});
        const configRes = await API.Setting.getSetting([appMeta?.namespace, 'system'])
        setConfig(typeof configRes === 'string' ? safeParse(configRes) : (configRes || DefaultConfig));
        const hierarchyRes = await API.File.getHierarchy({fileId})
        // if(hierarchyRes?.projectId) {
        //   setHierarchy(hierarchyRes)
        // }
        setHierarchy(hierarchyRes || {})
      } catch(e: any) {
        console.log(e)
        message.error(`应用初始化数据失败, ${e.message}`);
      }
    })()
  }, [fileId])

  useLayoutEffect(() => {
    if(user && content && installedApps && config && hierarchy) {
      const nodes = onLoad({
        user,
        get installedApps() {
          return installedApps;
        },
        get fileId() {
          return fileId;
        },
        get fileContent() {
          /** 防止外层对 content 进行修改 */
          return content ? JSON.parse(JSON.stringify(content)) : {};
        },
        get config() {
          return JSON.parse(JSON.stringify(config));
        },
        get meta() {
          return appMeta
        },
        openUrl({
          url,
          onFailed,
          params = {},
          onSuccess
        }: { url: string, params: any, onSuccess: Function, onFailed: Function }) {
          const [schema, removeSchemaPart] = url.split('://');
          const [pathPart] = removeSchemaPart?.split('?');
          const [namespace, action] = pathPart?.split('/');
          let urlSchema = '';
          installedApps?.forEach((app: IInstalledApp) => {
            if (app.namespace === namespace) {
              app?.exports?.forEach(e => {
                if (e.name === action) {
                  urlSchema = e.path;
                }
              })
            }
          });
          if (!urlSchema) {
            onFailed?.({
              code: -1,
              message: `应用 ${namespace} 未对外暴露 ${action} 能力!`
            })
          } else {
            if (urlSchema.endsWith('html')) {
              setSDKModalInfo({
                open: true,
                params,
                url: urlSchema,
                onSuccess,
                onFailed,
                onClose: () => setSDKModalInfo({open: false}),
              });
            } else if (urlSchema.endsWith('js')) {
              axios.get(urlSchema).then((res) => {
                try {
                  eval(res.data);
                  let fn;
                  if (window?.[action]?.default) {
                    fn = window?.[action]?.default;
                  } else {
                    fn = window?.[action];
                  }
                  fn({...params, onSuccess, onFailed});
                } catch (e) {
                  console.log(e);
                }
              })
            } else {
              console.log('invalid url schema');
            }
          }
        },
        get projectId() {
          // @ts-ignore
          return hierarchy?.projectId
        },
        get hasMaterialApp() {
          // @ts-ignore
          return (installedApps || [])?.some?.((app) => app?.namespace === 'mybricks-material')
        }
      })
      console.log('SDK 初始化', user, fileId)
      setJSX(nodes as any)
    }
  }, [user, fileId, content, config, installedApps, hierarchy])

  return (
    <GlobalContext.Provider value={{fileContent: content, user, fileId}}>
      <div className={`${css.view} ${className}`}>
        {jsx}
        {sdkModalInfo.open ? <SDKModal modalInfo={sdkModalInfo}/> : null}
      </div>
    </GlobalContext.Provider>
  )
}

function Loading() {
  return (
    <div className={css.loadingContainer}>
      <div className={css.loadingText}>
        加载中，请稍后...
      </div>
    </div>
  )
}
