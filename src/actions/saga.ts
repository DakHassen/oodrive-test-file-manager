import { put, takeLatest, all } from 'redux-saga/effects';
import axios from 'axios';


const runOurAction = function* () {
    let remoteData;
    yield axios.get('').then((resp) => {
        remoteData =resp.data[0];
    });

    yield put({type:'SET_DATA',payload:remoteData});
}

function* getAsyncDatawatcher() {
    yield takeLatest('GET_ASYNC_DATA', runOurAction);
}

export default function* rootSaga(){
    yield all([getAsyncDatawatcher()]);
}