import { CacheStore } from '@/data/protocols/cache'
import { SavePurchases } from '@/domain/usecases/save-purchases.usecase'

export class CacheStoreSpy implements CacheStore {
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
