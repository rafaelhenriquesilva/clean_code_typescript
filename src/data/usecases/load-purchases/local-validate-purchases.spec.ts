import { LocalLoadPurchases } from '@/data/usecases/load-purchases'
import { mockPurchases, CacheStoreSpy, getCacheExpirationDate } from '@/data/tests'

type SutTypes = {
    sut: LocalLoadPurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {

    const cacheStore = new CacheStoreSpy()
    const sut = new LocalLoadPurchases(cacheStore, timestamp)

    return {
        sut,
        cacheStore
    }
}


describe('LocalValidatePurchases', () => {
    it('Should not delete cache or insert on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    })
    it('Should return empty list if load fails', () => {
        const { cacheStore ,sut} = makeSut()
        cacheStore.simulateFetchError()
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    
    it('Should has no side effects if load succeds', () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore ,sut} = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp
        }
        sut.validate()
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
    })

})