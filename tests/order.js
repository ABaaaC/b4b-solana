const anchor = require("@project-serum/anchor");
// const { Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { LAMPORTS_PER_SOL } = require("@solana/web3.js");

const { expect, assert } = require('chai');
const fs = require('fs');
const bs58 = require('bs58');


describe("order", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(); // env() is possible
  anchor.setProvider(provider);

  const influencerInfo = anchor.web3.Keypair.fromSeed(
    Uint8Array.from(JSON.parse(fs.readFileSync('tests/influencer_info.json'))).slice(0, 32)
  );
  const orderInfo = anchor.web3.Keypair.generate();
  const buisness = anchor.web3.Keypair.fromSeed(
    Uint8Array.from(JSON.parse(fs.readFileSync('tests/buisness.json'))).slice(0, 32)
  );

  const influencer = anchor.web3.Keypair.fromSeed(
    Uint8Array.from(JSON.parse(fs.readFileSync('tests/infl.json'))).slice(0, 32)
  );

  const program = anchor.workspace.Order;
  const programInfl = anchor.workspace.B4B;

  it("set cost equals to 159", async () => {
    const cost = 159;

    try {
        await programInfl.rpc.setCost(new anchor.BN(cost * LAMPORTS_PER_SOL), {
        accounts: {
            influencerInfo: influencerInfo.publicKey,
            influencer: influencer.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [influencerInfo, influencer],
        });
    } catch  {}

    const influencerInfoAccount = await programInfl.account.influencerInfo.fetch(influencerInfo.publicKey);
    expect(influencerInfoAccount.cost.toString()).to.be.eql((cost * LAMPORTS_PER_SOL).toString());
    expect(influencerInfoAccount.influencer).to.be.eql(influencer.publicKey)

  });

  it("init the order", async () => {

    const airdropSignature = await provider.connection.requestAirdrop(
        buisness.publicKey,
        3000 * LAMPORTS_PER_SOL,
      );
    await provider.connection.confirmTransaction(airdropSignature);

    await program.rpc.orderInit({
      accounts: {
        orderInfo: orderInfo.publicKey,
        influencerInfo: influencerInfo.publicKey,
        influencerProgram: programInfl.programId,
        buisness: buisness.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [orderInfo, buisness],
    });

    const influencerInfoFetched = await programInfl.account.influencerInfo.fetch(influencerInfo.publicKey);
    const orderInfoFetched = await program.account.orderInfo.fetch(orderInfo.publicKey);
    
    expect(orderInfoFetched.cost.toString()).to.be.eql(influencerInfoFetched.cost.toString());
    expect(orderInfoFetched.buisness).to.be.eql(buisness.publicKey);
    expect(orderInfoFetched.influencer).to.be.eql(influencer.publicKey);
    expect(orderInfoFetched.influencerInfoAddress).to.be.eql(influencerInfo.publicKey);
    expect(orderInfoFetched.booked).to.be.eql(false);

  });

  it("Book the order", async () => {

    const order_lamports_before = (await program.account.orderInfo.getAccountInfo(orderInfo.publicKey)).lamports
    const tx = await program.rpc.orderBooking({
      accounts: {
        orderInfo: orderInfo.publicKey,
        buisness: buisness.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [buisness],
    });
    await program.provider.connection.confirmTransaction(tx);

    const orderInfoAccount = await program.account.orderInfo.getAccountInfo(orderInfo.publicKey);
    const orderInfoFetched = await program.account.orderInfo.fetch(orderInfo.publicKey);

    expect((orderInfoAccount.lamports - order_lamports_before).toString()).equal(orderInfoFetched.cost.toString());

});

it("Approve the order", async () => {
    let orderInfoFetched = await program.account.orderInfo.fetch(orderInfo.publicKey);
    const influencerBalanceBefore = await provider.connection.getBalance(
        orderInfoFetched.influencer
      );
    
    const tx = await program.rpc.orderApprove({
      accounts: {
        orderInfo: orderInfo.publicKey,
        buisness: buisness.publicKey,
        influencer: orderInfoFetched.influencer,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [orderInfo, buisness],
    });
    await program.provider.connection.confirmTransaction(tx);

    const orderInfoBalance = await provider.connection.getBalance(
        orderInfo.publicKey
      );
    const influencerBalance = await provider.connection.getBalance(
        orderInfoFetched.influencer
      );

    expect(orderInfoBalance).eql(0);
    assert.isAtLeast(influencerBalance - influencerBalanceBefore, orderInfoFetched.cost.toNumber());

});

});







    // const transferTransaction = new Transaction().add(
    //     SystemProgram.transfer({
    //       fromPubkey: buisness.publicKey,
    //       toPubkey: orderInfo.publicKey,
    //       lamports: orderInfoAccount.cost * LAMPORTS_PER_SOL, 
    //     })
    //   );
      
    //   await sendAndConfirmTransaction(provider.connection, transferTransaction, [buisness]);
  


        // console.log(buisness.getAccountInfo);
    // const airdropSignature = await provider.connection.requestAirdrop(buisness.publicKey, 1_000_000);
    // const latestBlockHash = await provider.connection.getLatestBlockhash();
    // await provider.connection.confirmTransaction({
    //     blockhash: latestBlockHash.blockhash,
    //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    //     airdropSignature,
    // });