import { configureStore } from '@reduxjs/toolkit';
import { deliverableApi } from '../services/deliverablesApi';
import { categoryMasterApi } from '../services/categoryMasterApi';
import { categorySubMasterApi } from '../services/categorySubMasterApi';
import { eventSuperMasterApi } from '../services/eventSuperMasterApi';
import { eventMasterApi } from '../services/eventMasterApi';
import { categoryWiseDeliverablesApi } from '../services/categoryWiseDeliverableMasterApi';
import { sponsorMasterApi } from '../services/sponsorMasterApi';
import { userMasterApi } from '../services/userMasterApi';
import { expoRegistryApi } from '../services/expoRegistryApi';
import createWebSocketMiddleware, { wsMessageReceived } from './websocketMiddleware';
import { listenerMiddleware } from './listenerMiddleware';
import { awardMasterApi } from '../services/awardMasterApi';
import { awardRegistryApi } from '../services/awardRegistryApi';
import { curatedSessionApi } from '../services/curatedSessionApi';
import { ministerialSessionApi } from '../services/ministerialSessionApi';
import { slotMasterApi } from '../services/slotMasterApi';
import { passesRegistryApi } from '../services/passesRegistryApi';
import { speakerTrackerApi } from '../services/speakerTrackerApi';
import { accountMasterApi } from '../services/accountMasterApi';
// WebSocket URL
// const WS_URL = "wss://events-api.chinimandi.com/wss";
const WS_URL = "ws://localhost:8000/ws";

export const store = configureStore({
  reducer: {
    [deliverableApi.reducerPath]: deliverableApi.reducer,
    [categoryMasterApi.reducerPath]: categoryMasterApi.reducer,
    [categorySubMasterApi.reducerPath]: categorySubMasterApi.reducer,
    [eventSuperMasterApi.reducerPath]: eventSuperMasterApi.reducer,
    [eventMasterApi.reducerPath]: eventMasterApi.reducer,
    [categoryWiseDeliverablesApi.reducerPath]: categoryWiseDeliverablesApi.reducer,
    [sponsorMasterApi.reducerPath]: sponsorMasterApi.reducer,
    [userMasterApi.reducerPath]: userMasterApi.reducer,
    [expoRegistryApi.reducerPath]: expoRegistryApi.reducer,
    [awardMasterApi.reducerPath]: awardMasterApi.reducer,
    [awardRegistryApi.reducerPath]: awardRegistryApi.reducer,
    [curatedSessionApi.reducerPath]: curatedSessionApi.reducer,
    [ministerialSessionApi.reducerPath]: ministerialSessionApi.reducer,
    [slotMasterApi.reducerPath]: slotMasterApi.reducer,
    [passesRegistryApi.reducerPath]: passesRegistryApi.reducer,
    [speakerTrackerApi.reducerPath]: speakerTrackerApi.reducer,
    [accountMasterApi.reducerPath]: accountMasterApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(createWebSocketMiddleware(WS_URL))
      .concat(deliverableApi.middleware)
      .concat(categoryMasterApi.middleware)
      .concat(categorySubMasterApi.middleware)
      .concat(eventSuperMasterApi.middleware)
      .concat(eventMasterApi.middleware)
      .concat(categoryWiseDeliverablesApi.middleware)
      .concat(sponsorMasterApi.middleware)
      .concat(userMasterApi.middleware)
      .concat(expoRegistryApi.middleware)
      .concat(awardMasterApi.middleware)
      .concat(awardRegistryApi.middleware)
      .concat(curatedSessionApi.middleware)
      .concat(ministerialSessionApi.middleware)
      .concat(slotMasterApi.middleware)
      .concat(passesRegistryApi.middleware)
      .concat(speakerTrackerApi.middleware)
      .concat(accountMasterApi.middleware)
});