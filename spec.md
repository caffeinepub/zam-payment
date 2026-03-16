# Zam Payment

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Prepaid digital wallet with balance display
- Add Money flow: manual entry + preset amounts (100, 500, 1000)
- Scan Any QR button (UPI merchant QR scanner)
- Recent Transactions on home screen: merchant name, amount, date, status (Paid/Failed)
- Monthly spend limit of 5000/month — warning shown only when user tries to exceed it
- Pay Bills section: Electricity, Mobile Recharge, Water
- Full Transaction History tab
- Bottom navigation: Wallet, Scanner, Pay Bills, History

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- Wallet state: balance (Nat), monthlySpent (Nat), transactions list
- addMoney(amount: Nat): adds to wallet balance
- makePayment(merchant: Text, amount: Nat): deducts from wallet, records transaction, enforces 5000/month limit
- getBalance(): returns current balance
- getTransactions(): returns list of transactions (merchant, amount, date, status)
- getMonthlySpent(): returns amount spent this month
- payBill(category: Text, amount: Nat): records a bill payment transaction

### Frontend
- Home/Wallet screen: balance card, Add Money button, Scan QR button, Recent Transactions list
- Add Money modal: preset buttons (100, 500, 1000) + manual input
- QR Scanner screen: camera-based QR scanner UI
- Pay Bills screen: grid of bill categories (Electricity, Mobile Recharge, Water)
- History screen: full paginated transaction list
- Monthly limit warning modal: shown when payment would exceed 5000/month
- Dark mode theme, blue and gold accents, mobile-first layout
