import { Router } from '@vaadin/router';
import Axios from 'axios';

import { API_URL } from '@/config';
import { storage } from '@/utils/storage';

import { ApiError } from './api-error';

export const axios = Axios.create({
  baseURL: API_URL,
});

axios.interceptors.request.use(config => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = 'application/json';
  return config;
});

axios.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error instanceof Axios.AxiosError && error.response) {
      // redirect to /login on any 401 unauthorized response
      if (error.response.status === 401) {
        Router.go('/login');
      }

      return Promise.reject(
        new ApiError({
          message: error.response.data.message,
          statusCode: error.response.status,
          data: error.response.data,
        })
      );
    } else {
      if (error.code === 'ERR_NETWORK') {
        Router.go('/error/network');
      }

      return Promise.reject(error);
    }
  }
);
