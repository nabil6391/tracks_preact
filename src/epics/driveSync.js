
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/never';
import 'rxjs/add/observable/fromPromise';


import * as action from '../store/actions';


const FILE = 'tracks.json';

/* global gapi */


export function syncStoreToDrive(action$, store) {
  return action$.ofType(action.SYNC_STORE)
    .switchMap(a => {
      return Observable.fromPromise(load())
        .map((rstate)=>{
          return {
            type: action.SYNC_STORE_OK,
            payload: {
              rstate,
              state: store.getState()
            }
          }
        })
    })
}


export function syncStoreToDriveOk(action$, store) {
  return action$.ofType(action.SYNC_STORE_OK)
    .switchMap(s =>
      Observable.fromPromise(upload(store.getState()))
        .switchMap(o => Observable.never())
    );
}


function delve(obj, key, def, p) {
  p = 0;
  key = key.split ? key.split('.') : key;
  while (obj && p<key.length) obj = obj[key[p++]];
  return obj===undefined ? def : obj;
}



const create = function () {
  return gapi.client.drive.files
    .create({
      fields: 'id',
      resource: { name: FILE, parents: ['appDataFolder'] }
    })
    .then(response => {
      return delve(response, 'result.id', null);
    });
};


const prepare = function() {
  return gapi.client.drive.files
    .list({
      q: `name="${FILE}"`,
      spaces: 'appDataFolder',
      fields: 'files(id,modifiedTime)'
    }).then(resp => {
      return delve(resp, 'result.files.0.id') || create();
    });
};

export const load = () => {
  return prepare().then(id => {
    return gapi.client.drive.files
      .get({fileId: id, alt: 'media'})
      .then(resp => {
        return delve(resp, 'result')
      });
  });
};


export const upload = (state) => {
  return prepare().then(id =>
    gapi.client.request({
      path: `/upload/drive/v3/files/${id}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: JSON.stringify(state)
    })
  );
};


window.prepare = prepare;
window.upload = upload;
window.load = load;
