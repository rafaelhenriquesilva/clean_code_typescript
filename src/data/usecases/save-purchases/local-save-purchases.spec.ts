import { CacheStore } from "@/data/protocols/cache"
import { LocalSavePurchases } from '@/data/usecases/save-purchases'
import { SavePurchases } from "@/domain/usecases/save-purchases.usecase"
import { mockPurchases } from '@/data/tests'
class CacheStoreSpy implements CacheStore {
    deleteKey: string
    insertKey: string
    deleteCallsCount = 0
    insertCallCount = 0
    insertValues: Array<SavePurchases.Params> = []

    insert(key: string, value:any): void {
        this.insertCallCount++
        this.insertKey = key
        this.insertValues = value
    }

    delete(key: string): void {
        this.deleteKey = key
        this.deleteCallsCount++
    }

    simulateDeleteError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => { throw new Error() })
    }

    simulateInsertError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => { throw new Error() })
    }
}

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