import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BillPayment {
    status: TransactionStatus;
    date: Time;
    billType: BillType;
    amount: bigint;
}
export type Time = bigint;
export interface Merchant {
    name: string;
    merchantId: Principal;
}
export interface Transaction {
    status: TransactionStatus;
    date: Time;
    merchant: Merchant;
    amount: bigint;
}
export enum BillType {
    electricity = "electricity",
    mobile = "mobile",
    water = "water"
}
export enum TransactionStatus {
    successful = "successful",
    failed = "failed"
}
export interface backendInterface {
    addMoney(amount: bigint): Promise<void>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBillPayments(): Promise<Array<BillPayment>>;
    getMonthlySpent(): Promise<bigint>;
    getWalletBalance(): Promise<bigint>;
    makePayment(merchantId: Principal, merchantName: string, amount: bigint): Promise<void>;
    payBill(billType: BillType, amount: bigint): Promise<void>;
}
