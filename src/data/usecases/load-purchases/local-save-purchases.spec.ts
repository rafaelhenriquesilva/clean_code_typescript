import { LocalLoadPurchases } from '@/data/usecases/load-purchases'
import { mockPurchases, CacheStoreSpy } from '@/data/tests'

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

    it('Should not insert new cache if delete faiils', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.actions).toEqual([
            CacheStoreSpy.Action.delete
        ])
        await expect(promise).rejects.toThrow()
    })

    it('Should  insert new cache  and delete success', async () => {
        const timestamp = new Date()
        const { sut, cacheStore } = makeSut(timestamp)
        const purchases = mockPurchases()
        const promise = sut.save(purchases)
        expect(cacheStore.actions).toEqual([
            CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert
        ])
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(cacheStore.insertKey).toBe('purchases')
        expect(cacheStore.insertValues).toEqual({
            timestamp,
            value: purchases
        })
        await expect(promise).resolves.toBeFalsy()
    })

    it('Should  throw if insert success', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.actions).toEqual([
            CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert
        ])
        await expect(promise).rejects.toThrow()
    })
})