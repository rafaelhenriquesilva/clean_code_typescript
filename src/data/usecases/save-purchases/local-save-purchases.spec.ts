import { CacheStore } from "@/data/protocols/cache"
import {LocalSavePurchases} from '@/data/usecases/save-purchases'
class CacheStoreSpy implements CacheStore {
    key:string
        deleteCallsCount = 0
        insertCallCount = 0

    delete(key: string): void {
        this.key = key
        this.deleteCallsCount++
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
        await sut.save()
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.key).toBe('purchases')
    })

    it('Should not insert not save new cache if delete faiils', async () => {
        const { sut, cacheStore } = makeSut()
        jest.spyOn(cacheStore, 'delete').mockImplementation(() => { throw new Error() })
        const promise = sut.save()
        expect(cacheStore.insertCallCount).toBe(0)
        expect(promise).rejects.toThrow()
    })
})