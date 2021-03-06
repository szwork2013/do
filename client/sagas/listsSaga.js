import api from '../services/api';
import types from '../constants/actionTypes';
import { takeEvery } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects'
import { createList, removeList, updateList } from '../actions/listsActions';
import { getCardsLength } from '../selectors/cardsSelectors';
import { addListId, removeListId, incListsLength, decListsLength, decCardsLength } from '../actions/boardsActions';
import { hideModal } from '../actions/modalActions';

export function* createListTask(action) {
  const { boardId, title } = action.payload;
  try {
    const payload = yield call(api.createList, boardId, title);
    yield put(createList.success(payload));
    yield put(addListId(boardId, payload.result.list));
    yield put(incListsLength(boardId));
    yield put(hideModal());
  } catch(err) {
    yield put(createList.failure(err.message));
  }
}

export function* removeListTask(action) {
  try {
    const { boardId, listId } = action.payload;

    const payload = yield call(api.removeList, listId);
    const cardsLength = yield select(getCardsLength, { listId });

    yield put(removeList.success(payload));
    yield put(removeListId(boardId, listId));
    yield put(decListsLength(boardId));
    yield put(decCardsLength(boardId, cardsLength));
    yield put(hideModal());
  } catch(err) {
    yield put(removeList.failure(err.message));
  }
}

export function* updateListTask(action) {
  try {
    const { id, props } = action.payload;
    const payload = yield call(api.updateList, id, props);
    yield put(updateList.success(payload));
    yield put(hideModal());
  } catch(err) {
    yield put(updateList.failure(err.message));
  }
}

export function* watchCreateList() {
  yield* takeEvery(types.LIST_CREATE_REQUEST, createListTask);
}

export function* watchRemoveList() {
  yield* takeEvery(types.LIST_REMOVE_REQUEST, removeListTask);
}

export function* watchUpdateList() {
  yield* takeEvery(types.LIST_UPDATE_REQUEST, updateListTask);
}

export default function* listsSaga() {
  yield [
    watchCreateList(),
    watchRemoveList(),
    watchUpdateList(),
  ];
}
