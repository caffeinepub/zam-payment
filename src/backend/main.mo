import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type Merchant = {
    name : Text;
    merchantId : Principal;
  };

  type TransactionStatus = {
    #failed;
    #successful;
  };

  type Transaction = {
    merchant : Merchant;
    amount : Nat;
    date : Time.Time;
    status : TransactionStatus;
  };

  type BillType = {
    #electricity;
    #mobile;
    #water;
  };

  type BillPayment = {
    billType : BillType;
    amount : Nat;
    date : Time.Time;
    status : TransactionStatus;
  };

  type Wallet = {
    balance : Nat;
    transactions : [Transaction];
    billPayments : [BillPayment];
    monthlySpent : Nat;
    monthlyLimit : Nat;
  };

  module Wallet {
    public func create() : Wallet {
      {
        balance = 0;
        transactions = [];
        billPayments = [];
        monthlySpent = 0;
        monthlyLimit = 5000;
      };
    };
  };

  let wallets = List.empty<(Principal, Wallet)>();

  public shared ({ caller }) func addMoney(amount : Nat) : async () {
    if (amount == 0) {
      Runtime.trap("You must deposit an amount greater than 0");
    };

    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) {
        let newWallet = Wallet.create();
        let updatedWallet = { newWallet with balance = amount };
        wallets.add((caller, updatedWallet));
      };
      case (?(principal, existingWallet)) {
        let updatedWallet = {
          balance = existingWallet.balance + amount;
          transactions = existingWallet.transactions;
          billPayments = existingWallet.billPayments;
          monthlySpent = existingWallet.monthlySpent;
          monthlyLimit = existingWallet.monthlyLimit;
        };
        let idx = wallets.values().findIndex(func((p, _)) { p == caller });
        switch (idx) {
          case (null) {};
          case (?index) {
            let walletsArray = wallets.toArray();
            let filteredArray = walletsArray.filter(
              func(_, i) { i != index }
            );
            wallets.clear();
            wallets.addAll(filteredArray.values());
          };
        };
        wallets.add((caller, updatedWallet));
      };
    };
  };

  public query ({ caller }) func getWalletBalance() : async Nat {
    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { 0 };
      case (?(_, wallet)) { wallet.balance };
    };
  };

  public shared ({ caller }) func makePayment(merchantId : Principal, merchantName : Text, amount : Nat) : async () {
    if (amount == 0) {
      Runtime.trap("You must pay an amount greater than 0");
    };

    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { Runtime.trap("Wallet does not exist") };
      case (?(_, wallet)) {
        if (wallet.monthlySpent + amount > wallet.monthlyLimit) {
          Runtime.trap("Monthly created limit exceeded");
        };

        let newTransaction : Transaction = {
          merchant = { name = merchantName; merchantId };
          amount;
          date = Time.now();
          status = #successful;
        };

        let updatedWallet = {
          balance = wallet.balance - amount;
          transactions = wallet.transactions.concat([newTransaction]);
          billPayments = wallet.billPayments;
          monthlySpent = wallet.monthlySpent + amount;
          monthlyLimit = wallet.monthlyLimit;
        };

        let idx = wallets.values().findIndex(func((p, _)) { p == caller });
        switch (idx) {
          case (null) {};
          case (?index) {
            let walletsArray = wallets.toArray();
            let filteredArray = walletsArray.filter(
              func(_, i) { i != index }
            );
            wallets.clear();
            wallets.addAll(filteredArray.values());
          };
        };
        wallets.add((caller, updatedWallet));
      };
    };
  };

  public shared ({ caller }) func payBill(billType : BillType, amount : Nat) : async () {
    if (amount == 0) {
      Runtime.trap("You must pay an amount greater than 0");
    };

    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { Runtime.trap("Wallet does not exist") };
      case (?(_, wallet)) {
        if (wallet.monthlySpent + amount > wallet.monthlyLimit) {
          Runtime.trap("Monthly created limit exceeded");
        };

        let newBillPayment : BillPayment = {
          billType;
          amount;
          date = Time.now();
          status = #successful;
        };

        let updatedWallet = {
          balance = wallet.balance - amount;
          transactions = wallet.transactions;
          billPayments = wallet.billPayments.concat([newBillPayment]);
          monthlySpent = wallet.monthlySpent + amount;
          monthlyLimit = wallet.monthlyLimit;
        };

        let idx = wallets.values().findIndex(func((p, _)) { p == caller });
        switch (idx) {
          case (null) {};
          case (?index) {
            let walletsArray = wallets.toArray();
            let filteredArray = walletsArray.filter(
              func(_, i) { i != index }
            );
            wallets.clear();
            wallets.addAll(filteredArray.values());
          };
        };
        wallets.add((caller, updatedWallet));
      };
    };
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { [] };
      case (?(_, wallet)) { wallet.transactions };
    };
  };

  public query ({ caller }) func getBillPayments() : async [BillPayment] {
    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { [] };
      case (?(_, wallet)) { wallet.billPayments };
    };
  };

  public query ({ caller }) func getMonthlySpent() : async Nat {
    switch (wallets.find(func((principal, _)) { principal == caller })) {
      case (null) { 0 };
      case (?(_, wallet)) { wallet.monthlySpent };
    };
  };
};
