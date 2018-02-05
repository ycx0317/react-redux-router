/**
 * Created by anchao on 2016/6/29.
 */
import { $ } from 'common/Util'

/* eslint-disable no-undef */
const host = domain
/*
 * 用法：如下
 * url: '/todos/:todoId/getTodoContent'
 * params: { todoId: 100 }
 * data: { searchText: 'alex' }
 */

const handleWithParameter = function (url, {
    method = 'GET',
    params = {},
    data = {}
}) {
    let result = url
    for (const key in params) {
        if ({}.hasOwnProperty.call(params, key)) {
            result = result.replace(new RegExp(`:${key}`, 'g'), params[key])
        }
    }
    const urlFull = `${host}${result}`
    const settings = {
        method,
        data,
        contentType: 'application/json',
        dataType: 'json'
    }
    return $.ajax(urlFull, settings)
}

/* eslint-enable */
export default class ServiceBase {
    static postWithParameter(url, oSettings) {
        return handleWithParameter(url, { ...oSettings, method: 'POST' })
    }

    static getWithParameter(url, oSettings) {
        return handleWithParameter(url, { ...oSettings, method: 'GET' })
    }
    
    static putWithParameter(url, oSettings) {
        return handleWithParameter(url, { ...oSettings, method: 'PUT' })
    }
    
    static deleteWithParameter(url, oSettings) {
        return handleWithParameter(url, { ...oSettings, method: 'DELETE' })
    }
}
