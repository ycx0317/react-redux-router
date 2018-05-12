/**
 * Created by Anchao on 2017/6/29.
 * 非业务底层扩展封装
 */
import React from 'react'
import {
    createAction,
    handleAction, handleActions as originalHandleActions,
    combineActions
} from 'redux-actions'
import Loadable from 'react-loadable'
import qs from 'qs'
import axios from 'axios'
import dialog from 'dialog'
import loading from 'loading'
import ComLoading from './components/ComponentLoading'

// ajax 统一配置
const instance = axios.create({
    method: 'get',
    baseURL: '',
    timeout: 0,
    responseType: 'json'
})
const handleWithParameter = function (url, {
    method = 'GET',
    contentType = 'application/x-www-form-urlencoded; charset=UTF-8',
    params = {},
    data = {}
}) {
    const { headers } = instance.defaults
    instance.defaults.headers = { ...headers, 'Content-Type': contentType }

    // url替换参数
    let urlNew = url
    const paramsNew = { ...params }
    /*eslint-disable*/
    for (const key in params) {
        const reg = new RegExp(`:${key}`, 'g')
        if ({}.hasOwnProperty.call(params, key) && reg.test(urlNew)) {
            urlNew = urlNew.replace(reg, params[key])
            delete paramsNew[key]
        }
    }

    switch (method.toLowerCase()) {
        case 'get':
            return instance.get(urlNew, { params: paramsNew })
        case 'delete':
            return instance.delete(urlNew, { params: paramsNew })
        case 'post':
            return instance.post(urlNew, qs.stringify(data))
        case 'put':
            return instance.put(urlNew, qs.stringify(data))
        default: {
            const res = {
                then: resolve => resolve({
                    statusCode: 300,
                    msg: 'method方式错误'
                })
            }
            return Promise.resolve(res)
        }
    }
}

// 增强createActions, 可以配置{}
const createActions = function (actionMap) {
    const eventNames = Object.keys(actionMap)
    const fnsMap = {}
    eventNames.forEach((eventName) => {
        const configOrFn = actionMap[eventName]
        if (typeof configOrFn !== 'function') {
            const config = { method: 'GET', ...configOrFn }
            fnsMap[eventName] = (settings = {}) => (dispatch) => {
                // const loading = require('loading').default
                // const dialog = require('dialog').default

                if ((configOrFn.hasLoading || configOrFn.hasLoading === undefined) && !loading.getLoadingStatus()) loading.show()
                dispatch(createAction(`${configOrFn.actionType}_PRE`)())
                return handleWithParameter(
                    config.url,
                    {
                        ...settings,
                        ...config
                    }
                ).then((res) => {
                    loading.hide()

                    const { statusCode, msg } = res.data
                    const data = res.data.data === undefined ? res.data : res.data.data
                    if (statusCode === 200) {
                        dispatch(createAction(`${configOrFn.actionType}_SUCCESS`)(data))
                        dispatch(createAction(`${configOrFn.actionType}_ALWAYS`)())
                        return res.data
                    }

                    if (configOrFn.handleError || configOrFn.handleError === undefined) {
                        dialog.alert({
                            title: '错误',
                            infoType: 'error',
                            content: <div>{msg}</div>
                        })
                    }

                    dispatch(createAction(`${configOrFn.actionType}_ERROR`)(data))
                    dispatch(createAction(`${configOrFn.actionType}_ALWAYS`)())
                    return data
                }).catch((error) => {
                    loading.hide()

                    if(error.response){
                        dispatch(createAction(`${configOrFn.actionType}_FAIL`)())
                        dispatch(createAction(`${configOrFn.actionType}_ALWAYS`)())
                        dialog.alert({
                            title: '错误',
                            infoType: 'error',
                            content: <div>服务器端错误<span role="img" aria-label="cry">😂</span>！</div>
                        })
                    } else {
                        dialog.alert({
                            title: '错误',
                            infoType: 'error',
                            content: <div>{error.message}！<br />{error.stack}</div>
                        })
                    }
                })
            }
        } else {
            fnsMap[eventName] = configOrFn
        }
    })

    return fnsMap
}

// 增强handleActions，可以配置{}
const handleActions = function (reducerMap, defaultState) {
    const result = { ...reducerMap }
    Object.keys(result).forEach((actionType) => {
        const fnOrObject = result[actionType]
        if (fnOrObject && typeof fnOrObject !== 'function') {
            Object.keys(fnOrObject).forEach((suffixAction) => {
                result[`${actionType}_${suffixAction.toUpperCase()}`] = fnOrObject[suffixAction]
            })
        }
    })

    return originalHandleActions(result, defaultState)
}

// 懒加载组件
const lazyload = importUrl => Loadable({
    loading: ComLoading,
    loader: () => importUrl
})

export {
    createAction,
    createActions,
    handleAction,
    originalHandleActions,
    handleActions,
    combineActions,
    lazyload,
    dialog
}
