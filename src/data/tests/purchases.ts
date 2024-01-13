import { SavePurchases } from "@/domain/usecases/save-purchases.usecase";
export const mockPurchases = (): Array<SavePurchases.Params> => [
    {
        id: '1',
        date: new Date(),
        value: 100
    }
]
