/**
 * Create the store with dynamic reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
// import createSagaMiddleware from 'redux-saga';
// import { createEpicMiddleware, combineEpics } from 'redux-observable';
import createReducer from './reducers/index';
import logger from 'redux-logger';
import rootEpic from './epics/index';

// const sagaMiddleware = createSagaMiddleware();
// const rxMiddleware = createEpicMiddleware();

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    // rxMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
    applyMiddleware(rootEpic, logger)
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
        // Prevent recomputing reducers for `replaceReducer`
        shouldHotReload: false,
      })
      : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer,
    // fromJS(initialState),
    initialState,
    composeEnhancers(...enhancers)
  );

 
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer('./reducers/index'));
    });
  }

  return store;
}
