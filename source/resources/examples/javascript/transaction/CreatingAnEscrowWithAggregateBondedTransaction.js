/*
 *
 * Copyright 2018 NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const nem2Sdk = require("nem2-sdk");
const operators = require('rxjs/operators');

const Account = nem2Sdk.Account,
    Deadline = nem2Sdk.Deadline,
    NetworkType = nem2Sdk.NetworkType,
    TransferTransaction = nem2Sdk.TransferTransaction,
    TransactionHttp = nem2Sdk.TransactionHttp,
    PlainMessage = nem2Sdk.PlainMessage,
    XEM = nem2Sdk.XEM,
    AggregateTransaction = nem2Sdk.AggregateTransaction,
    LockFundsTransaction = nem2Sdk.LockFundsTransaction,
    UInt64 = nem2Sdk.UInt64,
    Listener = nem2Sdk.Listener,
    Mosaic = nem2Sdk.Mosaic,
    MosaicId = nem2Sdk.MosaicId,
    PublicAccount = nem2Sdk.PublicAccount,
    filter = operators.filter,
    mergeMap = operators.mergeMap;

// 01 - Setup
const nodeUrl = 'http://localhost:3000';
const transactionHttp = new TransactionHttp(nodeUrl);
const listener = new Listener(nodeUrl);

const alicePrivateKey = process.env.PRIVATE_KEY;
const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, NetworkType.MIJIN_TEST);

const ticketDistributorPublicKey = 'F82527075248B043994F1CAFD965F3848324C9ABFEC506BC05FBCF5DD7307C9D';
const ticketDistributorPublicAccount = PublicAccount.createFromPublicKey( ticketDistributorPublicKey, NetworkType.MIJIN_TEST);

const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(),
    ticketDistributorPublicAccount.address,
    [XEM.createRelative(100)],
    PlainMessage.create('send 100 nem:xem to distributor'),
    NetworkType.MIJIN_TEST);

const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic( new MosaicId('museum:ticket'), UInt64.fromUint(1))],
    PlainMessage.create('send 1 museum:ticket to alice'),
    NetworkType.MIJIN_TEST);

// 02 - Aggregate Transaction
const aggregateTransaction = AggregateTransaction.createBonded(Deadline.create(),
    [aliceToTicketDistributorTx.toAggregate(aliceAccount.publicAccount),
        ticketDistributorToAliceTx.toAggregate(ticketDistributorPublicAccount)],
    NetworkType.MIJIN_TEST);

const signedTransaction = aliceAccount.sign(aggregateTransaction);

const lockFundsTransaction = LockFundsTransaction.create(
    Deadline.create(),
    XEM.createRelative(10),
    UInt64.fromUint(480),
    signedTransaction,
    NetworkType.MIJIN_TEST);

const lockFundsTransactionSigned = aliceAccount.sign(lockFundsTransaction);

listener.open().then(() => {

    transactionHttp
        .announce(lockFundsTransactionSigned)
        .subscribe(x => console.log(x), err => console.error(err));

    listener
        .confirmed(aliceAccount.address)
        .pipe(
            filter((transaction) => transaction.transactionInfo !== undefined
                && transaction.transactionInfo.hash === lockFundsTransactionSigned.hash),
            mergeMap(ignored => transactionHttp.announceAggregateBonded(signedTransaction))
        )
        .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
            err => console.error(err));
});