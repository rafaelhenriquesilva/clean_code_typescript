import { CacheStore } from '@/data/protocols/cache'
import { LoadPurchases, SavePurchases } from '@/domain/usecases'

export const getCacheExpirationDate = (timestamp: Date): Date => {
    const maxCacheAge = new Date(timestamp)
    maxCacheAge.setDate(timestamp.getDate() - 3)
    return maxCacheAge
}

export class CacheStoreSpy implements CacheStore {
    actions: Array<CacheStoreSpy.Action> = []
    deleteKey: string
    insertKey: string
    fetchKey: string
    insertValues: Array<SavePurchases.Params> = []
    fetchResult: any

    insert(key: string, value:any): void {
        this.actions.push(CacheStoreSpy.Action.insert)
        this.insertKey = key
        this.insertValues = value
    }

    delete(key: string): void {
        this.actions.push(CacheStoreSpy.Action.delete)
        this.deleteKey = key
    }

    fetch(key: string): any {
        this.actions.push(CacheStoreSpy.Action.fetch)
        this.fetchKey = key
        return this.fetchResult
    }


    replace(key: string, value:any): void {
        this.delete(key)
        this.insert(key,value)
    }

    simulateDeleteError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => { 
            this.actions.push(CacheStoreSpy.Action.delete)
            throw new Error()
         })
    }

    simulateInsertError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => { 
            this.actions.push(CacheStoreSpy.Action.insert)
            throw new Error()
         })
    }

    simulateFetchError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'fetch').mockImplementationOnce(() => { 
            this.actions.push(CacheStoreSpy.Action.fetch)
            throw new Error()
         })
    }
}

export namespace CacheStoreSpy {
    export enum Action {
        delete,
        insert,
        fetch
    }
}
