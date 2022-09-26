import { Injectable } from "@angular/core"
import { BackendHttpClient } from "src/app/shared/services/backend/backend-http-client.service"
import { environment } from "src/environments/env.base"


@Injectable({
  providedIn: 'root',
})
export class AddressBookService {

    path = `${environment.backendURL}/api/blockchain-api/v1/address-book`

    constructor(private http: BackendHttpClient) { }

    addAddressBookEntry(alias: string, address: string, phoneNumber: string, email: string) {
        return this.http.post<AddressBookResponseData>(`${this.path}`, {
            alias: alias,
            address: address,
            phone_number: phoneNumber,
            email: email
        }, false, true, false)
    }

    getAddressBookEntriesForAddress(address: string) {
        return this.http.get<AddressBookResponseDataEntries>(`${this.path}/by-wallet-address/${address}`
        , { }, true, false, true)
    }

    deleteAddressBookEntryByID(id: string) {
        return this.http.delete(`${this.path}/${id}`, {}, false, true)
    }

}

export interface AddressBookResponseDataEntries {
    entries: AddressBookResponseData[]
}

export interface AddressBookResponseData {
    id: string,
    alias: string,
    address: string,
    phone_number: string,
    email: string,
    created_at: string
}