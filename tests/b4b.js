const anchor = require("@project-serum/anchor");
// const { AnchorProvider, web3 } = '@project-serum/anchor';
const assert = require("assert");

describe("b4b", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(); // env() is possible
  anchor.setProvider(provider);

  const influencerInfo = anchor.web3.Keypair.generate();

  const program = anchor.workspace.B4B;

  it("set cost equals to 139", async () => {

    await program.rpc.setCost(new anchor.BN(139), {
      accounts: {
        influencerInfo: influencerInfo.publicKey,
        influencer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [influencerInfo],
    });

    const influencerInfoAccount = await program.account.influencerInfo.fetch(influencerInfo.publicKey);
    assert.ok(influencerInfoAccount.cost.eq(new anchor.BN(139)));
  });
});

