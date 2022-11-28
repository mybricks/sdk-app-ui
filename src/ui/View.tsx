import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useMemo, useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { getCookies, getUrlParam, safeParse } from '../utils';
import { FileContent, ViewProps, ViewRef } from './type';

import css from './View.less'

const cookies = getCookies();
const API_SUCCESS_CODE = 1;
/**
 * 前端全局拦截，注入相关能力
 * @param props
 * @param ref
 * @constructor
 */
const View: ForwardRefRenderFunction<ViewRef, ViewProps> = (props, ref) => {
  const { children, extName, className = '' } = props;
	const user = useMemo(() => safeParse(cookies['mybricks-login-user']), []);
	const fileId = useMemo(() => Number(getUrlParam('id') ?? '0'), []);
	
  useImperativeHandle(ref, () => {
    return {
	    user,
	    get fileId() {
		    return fileId;
	    },
	    getFileContent() {
		    return axios({
			    method: 'get',
			    url: '/api/workspace/getFullFile',
			    params: { userId: user.email, fileId }
		    }).then(({ data }) => {
			    if (data.code === API_SUCCESS_CODE) {
				    return Promise.resolve(data.data);
			    } else {
				    message.error(`获取页面数据发生错误：${data.message}`);
						return Promise.reject();
			    }
		    });
	    },
	    save(params, config) {
		    return axios({
			    method: 'post',
			    url: '/api/workspace/saveFile',
			    data: {
				    userId: user.email,
				    fileId,
				    extName,
				    ...params,
			    }
		    }).then(({ data }) => {
			    if (data.code === API_SUCCESS_CODE) {
				    !config?.skipMessage && message.info(`保存完成`);
			    } else {
				    !config?.skipMessage && message.error(`保存失败：${data.message}`);
				    return Promise.reject(data.message);
			    }
		    });
	    },
	    publish(params, config) {
		    return axios({
			    method: 'post',
			    url: '/api/workspace/publish',
			    data: {
				    userId: user.email,
				    fileId,
				    extName,
				    ...params,
			    }
		    }).then(({ data }) => {
			    if (data.code === API_SUCCESS_CODE) {
				    !config?.skipMessage && message.info(`发布完成`);
			    } else {
				    !config?.skipMessage && message.error(`发布失败：${data.message}`);
						return Promise.reject(data.message);
			    }
		    })
	    }
    };
  }, [user, fileId, extName]);

  return (
    <div className={`${css.view} ${className}`}>
      {children}
    </div>
  )
}

export default forwardRef(View)