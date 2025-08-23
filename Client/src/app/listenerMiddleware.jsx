import { createListenerMiddleware } from '@reduxjs/toolkit';
import { wsMessageReceived } from './websocketMiddleware';
import { expoRegistryApi } from '../services/expoRegistryApi';
import { sponsorMasterApi } from '../services/sponsorMasterApi';
import { awardRegistryApi } from '../services/awardRegistryApi';
import { curatedSessionApi } from '../services/curatedSessionApi';
import { ministerialSessionApi } from '../services/ministerialSessionApi';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
    actionCreator: wsMessageReceived,
    effect: async (action, listenerApi) => {
        if (action.payload === "refresh_expo_registry") {
            console.log("Received refresh signal. Invalidating ExpoRegistry cache.");

            listenerApi.dispatch(
                expoRegistryApi.util.invalidateTags(['ExpoRegistry'])
            );
            listenerApi.dispatch(
                sponsorMasterApi.util.invalidateTags(['SponsorMaster'])
            );
            listenerApi.dispatch(
                awardRegistryApi.util.invalidateTags(['AwardRegistry'])
            );
             listenerApi.dispatch(
                curatedSessionApi.util.invalidateTags(['CuratedSession'])
            );
             listenerApi.dispatch(
                ministerialSessionApi.util.invalidateTags(['MinisterialSession'])
            );
        }
        else if (payload === "refresh_ministerial_sessions") {
            console.log("Received refresh signal. Invalidating Ministerial Sessions cache.");
            listenerApi.dispatch(
                ministerialSessionApi.util.invalidateTags(['MinisterialSession'])
            );
        }
    },
    
});