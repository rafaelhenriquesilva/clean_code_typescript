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


describe('LocalLoadPurchases', () => {
    it('Should not delete cache or insert on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    })
   
    it('Should return empty list if load fails', async () => {
        const { cacheStore ,sut} = makeSut()
        cacheStore.simulateFetchError()
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    it('Should return a list of purchases if cache is valid', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore ,sut} = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        let purchases = await sut.loadAll()
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(purchases).toEqual(cacheStore.fetchResult.value)
    })

    it('Should return a list of purchases if cache is expired', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() - 1)
        const { cacheStore ,sut} = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        let purchases = await sut.loadAll()
        
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    it('Should return a list of purchases if cache is on expiration date', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        const { cacheStore ,sut} = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        let purchases = await sut.loadAll()
        
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    it('Should return an empty list of purchases if cache is empty', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore ,sut} = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: []
        }
        let purchases = await sut.loadAll()
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(purchases).toEqual([])
    })
})