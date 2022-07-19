use anchor_lang::prelude::*;

declare_id!("3RQXPem1Cvzk7KFfhAAHRbtb86inXQjNyzN81K9zWVTs");

#[program]
pub mod b4b {
    use super::*;

    pub fn set_cost(ctx: Context<SetCost>, cost: i64) -> Result<()> {
        let influencer_info: &mut Account<InfluencerInfo> = &mut ctx.accounts.influencer_info;
        let influencer: &Signer = &ctx.accounts.influencer;

        influencer_info.influencer = *influencer.key;
        influencer_info.cost = cost;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetCost<'info> {
    #[account(init, payer=influencer, space=InfluencerInfo::LEN)]
    pub influencer_info: Account<'info, InfluencerInfo>,
    #[account(mut)]
    pub influencer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct InfluencerInfo {
    pub influencer: Pubkey,
    pub cost: i64,
    // pub point: i64,
}

const DISCRIMINATOR_LENGTH: usize = 8;
// pub struct Pubkey([u8; 32]);
const PUBLIC_KEY_LENGTH: usize = 32;
const COST_LENGTH: usize = 8;
// const POINT_LENGTH: usize = 8;

impl InfluencerInfo {
    const LEN: usize =  PUBLIC_KEY_LENGTH 
    + COST_LENGTH
    // + POINT_LENGTH
    + DISCRIMINATOR_LENGTH;
}
