import Types from 'KhabarkhunTypes';
import {resolveWithDelay} from './utils';


// Mock API
// tslint:disable-next-line:no-var-requires
const mockResponse: Types.Article[] = require('../../fixtures/articles.json');
export const Article = {
    get: (id: string) => resolveWithDelay(mockResponse.find(t => t._id === id)),
};

// Real API
// const URL = '/todos';
// export const Todos = {
//   getAll: (pageNumber?: number) =>
//     requests.get(`${URL}?${rangeQueryString(pageSize, pageNumber)}`),
//   get: (id: string) =>
//     requests.get(`${URL}/${id}`),
//   create: (payload: ITodoModel) =>
//     requests.post(`${URL}`, { payload }),
//   update: (payload: ITodoModel) =>
//     requests.put(`${URL}/${payload.id}`, { todo: removeKeys(payload, ['id']) }),
//   delete: (id: string) =>
//     requests.delete(`${URL}/${id}`),
// };
