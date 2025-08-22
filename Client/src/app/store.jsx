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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(deliverableApi.middleware)
      .concat(categoryMasterApi.middleware)
      .concat(categorySubMasterApi.middleware)
      .concat(eventSuperMasterApi.middleware)
      .concat(eventMasterApi.middleware)
      .concat(categoryWiseDeliverablesApi.middleware)
      .concat(sponsorMasterApi.middleware)
      .concat(userMasterApi.middleware)
      .concat(expoRegistryApi.middleware),
});