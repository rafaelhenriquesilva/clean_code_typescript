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
    it('Should not delete cache or insert on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.messages).toEqual([])
    })
    it('Should delete old cache on sut.save', async () => {
        const { sut, cacheStore } = makeSut()
        await sut.save(mockPurchases())
        expect(cacheStore.messages).toEqual([
            CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert
        ])
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    it('Should not insert new cache if delete faiils', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.messages).toEqual([
            CacheStoreSpy.Message.delete
        ])
        expect(promise).rejects.toThrow()
    })

    it('Should  insert new cache  if delete sucess', async () => {
        const { sut, cacheStore } = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases)
        expect(cacheStore.messages).toEqual([
            CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert
        ])
        expect(cacheStore.insertKey).toBe('purchases')

        expect(cacheStore.insertValues).toBe(purchases)
    })

    it('Should  throw if insert sucess', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.messages).toEqual([
            CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert
        ])
        expect(promise).rejects.toThrow()
    })
})