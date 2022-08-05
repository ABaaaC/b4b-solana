const anchor = require("@project-serum/anchor");
const { LAMPORTS_PER_SOL } = require("@solana/web3.js");
// const assert = require("assert");
const { expect } = require('chai');
const fs = require('fs');
const bs58 = require('bs58');


describe("b4b", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(); // env() is possible
  // console.log(provider);
  anchor.setProvider(provider);

  const influencerInfo = anchor.web3.Keypair.generate();
  // const influencerInfo = anchor.web3.Keypair.fromSeed(
  //   Uint8Array.from(JSON.parse(fs.readFileSync('tests/influencer_info.json'))).slice(0, 32)
  // );
    
  const influencer = anchor.web3.Keypair.fromSeed(
    Uint8Array.from(JSON.parse(fs.readFileSync('tests/infl.json'))).slice(0, 32)
  );

  const program = anchor.workspace.B4B;

  it("provider: set cost equals to 139", async () => {

    const airdropInfluencerSignature = await provider.connection.requestAirdrop(
      influencer.publicKey,
      300 * LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropInfluencerSignature); 

    const cost = 139;

    await program.rpc.setCost(new anchor.BN(cost), {
      accounts: {
        influencerInfo: influencerInfo.publicKey,
        influencer: influencer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [influencerInfo, influencer],
    });

    const influencerInfoFetched = await program.account.influencerInfo.fetch(influencerInfo.publicKey);
    expect(influencerInfoFetched.cost.toString()).to.be.eql(cost.toString());
    expect(influencerInfoFetched.influencer).to.be.eql(influencer.publicKey)

  });

  it("change the cost", async () => {
    const new_cost = 159;
    await program.rpc.changeCost(new anchor.BN(new_cost), {
      accounts: {
        influencerInfo: influencerInfo.publicKey,
        influencer: influencer.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [influencer],
    });

    const influencerInfoFetched = await program.account.influencerInfo.fetch(influencerInfo.publicKey);
    expect(influencerInfoFetched.cost.toString()).to.be.eql(new_cost.toString());
    expect(influencerInfoFetched.influencer).to.be.eql(influencer.publicKey)

  });

});

