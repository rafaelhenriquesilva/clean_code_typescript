import { LocalSavePurchases } from '@/data/usecases/save-purchases'
import { mockPurchases, CacheStoreSpy } from '@/data/tests'

type SutTypes = {
    sut: LocalSavePurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (): SutTypes => {

    const cacheStore = new CacheStoreSpy()
    const sut = new LocalSavePurchases(cacheStore)

    return {
        sut,
        cacheStore
    }
}


describe('LocalSavePurchases', () => {
    it('Should not delete cache on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.deleteCallsCount).toBe(0)
    })
    it('Should delete old cache on sut.save', async () => {
        const { sut, cacheStore } = makeSut()
        await sut.save(mockPurchases())
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    it('Should not insert not save new cache if delete faiils', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.insertCallCount).toBe(0)
        expect(promise).rejects.toThrow()
    })

    it('Should  insert new cache  if delete sucess', async () => {
        const { sut, cacheStore } = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases)
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.insertCallCount).toBe(1)
        expect(cacheStore.insertKey).toBe('purchases')

        expect(cacheStore.insertValues).toBe(purchases)
    })

    it('Should  throw if insert sucess', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchases())
        expect(promise).rejects.toThrow()
    })
})