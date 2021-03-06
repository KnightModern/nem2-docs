#######################
Cross-Chain Transaction
#######################

Cross-chain transactions enable **trading tokens** between **different blockchains**, without using an intermediary party in the process.

This exchange of tokens will succeed atomically. If some of the actors do not agree, each of them will receive the locked tokens back after a determined amount of time.

When talking about tokens in NEM, we are actually referring to :doc:`mosaics <../../concepts/mosaic>`. Catapult enables atomic swaps through :ref:`secret lock <secret-lock-transaction>` / :ref:`secret proof transaction <secret-proof-transaction>` mechanism.

.. _secret-lock-transaction:

***********************
Secret lock transaction
***********************

Use secret lock transaction to send mosaics to a recipient once an account discovers an attached secret message, known as *proof*.

Once announced, the specified mosaics are locked at blockchain level using the *hashed secret* message.

Funds are unlocked and transferred when an account announces a  valid :ref:`Secret Proof Transaction <secret-proof-transaction>`. The account must demonstrate knowing the *proof* that unlocks the transaction. Applying a ``hashing algorithm`` to the ``proof``, which should be equal to the hashed ``secret`` message.

If the transaction duration is reached and not proved, the locked amount is returned to the initiator of the secret lock transaction.

.. figure:: ../resources/images/guides-transactions-atomic-cross-chain-swap.png
    :align: center
    :width: 700px

    Atomic cross-chain swap between public and private network

Secret lock and proof transactions enable :doc:`atomic cross-chain swaps <../guides/transaction/atomic-cross-chain-swap-between-NEM-public-and-private-chain>`, without the necessity of trusting a third party.

    **Mosaic**

    Locked mosaic.

    **Duration**

    The duration for the funds to be released or returned.

    **Hash Type**

    Hash algorithm used, with which secret is generated.

    **Secret**

    The proof hashed.

    **Recipient**

    The address who will receive the funds once unlocked.

Based on `Bitcoin Atomic Cross Chain Trading <https://en.bitcoin.it/wiki/Atomic_cross-chain_trading>`_.

.. _secret-proof-transaction:

************************
Secret proof transaction
************************

Secret proof transaction is used to unlock :ref:`secret lock transactions <secret-lock-transaction>`.

To unlock a secret lock transaction, the account must demonstrate that knows the *proof* that unlocks the transaction.

    **Hash Type**

    Hash algorithm used, to check that proof hashed equals secret.

    **Secret**

    The proof hashed.

    **Proof**

    The proof seed.