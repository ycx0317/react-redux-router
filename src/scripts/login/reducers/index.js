/**
 * Created by anchao on 2016/7/27.
 */
import { handleActions } from 'common/Util'
import * as actionTypes from '../actions/actionTypes'

const inintialState = {
    errorMsg: '',
    userType: actionTypes.USER_TYPE[0]
}

const loginReducer = handleActions({
    [actionTypes.SET_ERROR](state, action){
        return {
            ...state,
            errorMsg: action.payload
        }
    },
    [actionTypes.SET_USER_TYPE](state, action){
        return {
            ...state,
            userType: actionTypes.USER_TYPE[parseInt(action.payload, 10)]
        }
    }
}, inintialState)

export default loginReducer
