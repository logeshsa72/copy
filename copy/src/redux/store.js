import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'


import { user, parties, greyYarnPo, greyYarnPoDelivery, greyYarnBillEntry, tax, greyFabricPo, dyedFabricPo, accessoryPo, dyedYarnPo, dyedYarnPoDelivery, greyFabricPoDelivery, dyedYarnBillEntry, dyedFabricPoDelivery } from "./services"

export const store = configureStore({
    reducer: {
        [user.reducerPath]: user.reducer,
        [parties.reducerPath]: parties.reducer,
        [greyYarnPo.reducerPath]: greyYarnPo.reducer,
        [dyedYarnPo.reducerPath]: dyedYarnPo.reducer,

        [dyedFabricPo.reducerPath]: dyedFabricPo.reducer,
        [greyYarnPoDelivery.reducerPath]: greyYarnPoDelivery.reducer,
        [dyedFabricPoDelivery.reducerPath]: dyedFabricPoDelivery.reducer,
        [dyedYarnPoDelivery.reducerPath]: dyedYarnPoDelivery.reducer,

        [greyYarnBillEntry.reducerPath]: greyYarnBillEntry.reducer,
        [dyedYarnBillEntry.reducerPath]: dyedYarnBillEntry.reducer,

        [tax.reducerPath]: tax.reducer,
        [greyFabricPo.reducerPath]: greyFabricPo.reducer,
        [greyFabricPoDelivery.reducerPath]: greyFabricPoDelivery.reducer,
        [accessoryPo.reducerPath]: accessoryPo.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            [
                user.middleware,
                parties.middleware,
                greyYarnPo.middleware,
                dyedYarnPo.middleware,

                dyedFabricPo.middleware,
                dyedFabricPoDelivery.middleware,

                greyYarnPoDelivery.middleware,
                dyedYarnPoDelivery.middleware,

                greyYarnBillEntry.middleware,
                dyedYarnBillEntry.middleware,

                tax.middleware,
                greyFabricPo.middleware,
                greyFabricPoDelivery.middleware,
                accessoryPo.middleware
            ]),

});

setupListeners(store.dispatch)