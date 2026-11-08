import { configureStore } from '@reduxjs/toolkit'
import { partsApi } from '../features/parts-search/api/partsApi.js'

export const store = configureStore({
  reducer: { [partsApi.reducerPath]: partsApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(partsApi.middleware),
})
