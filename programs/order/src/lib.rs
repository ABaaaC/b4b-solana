use anchor_lang::prelude::*;
// use b4b::cpi::accounts::SetData;
use b4b::program::B4b;
use b4b::{self, InfluencerInfo};

declare_id!("9AYGCbwCTLu5zRNRmynrz3xL5EjiDaoXjfLx2PTQQ4qA");

#[program]
pub mod order {
    use super::*;

        pub fn order_init(ctx: Context<OrderInit>) -> Result<()> {
            let order_info: &mut Account<OrderInfo> = &mut ctx.accounts.order_info;
            let influencer_info: &mut Account<InfluencerInfo> = &mut ctx.accounts.influencer_info;
            let buisness: &Signer = &ctx.accounts.buisness;
            order_info.buisness = *buisness.key;
            order_info.influencer_info_address = influencer_info.key();
            order_info.influencer = influencer_info.influencer;
            order_info.cost = influencer_info.cost;
            order_info.booked = false;

            // let buisness_from = ctx.accounts.buisness.to_account_info();
            // let order_info_to = ctx.accounts.order_info.to_account_info();
            // **buisness_from.try_borrow_mut_lamports()? -= 111;
            // **order_info_to.try_borrow_mut_lamports()? += 111;

            Ok(())
    }

    pub fn order_booking(ctx: Context<OrderBooking>) -> Result<()>
    {
        let order_info: &mut Account<OrderInfo> = &mut ctx.accounts.order_info;
        let buisness: &Signer = &ctx.accounts.buisness;

        let sol_transfer = anchor_lang::solana_program::system_instruction::transfer(
            &buisness.key(),
            &order_info.key(),
            order_info.cost,
        );
        anchor_lang::solana_program::program::invoke(
            &sol_transfer,
            &[
                buisness.to_account_info(),
                order_info.to_account_info(),
                // ctx.accounts.system_program.to_account_info(),
            ],
        ).unwrap();

        order_info.booked = true;

        Ok(())
    }
}



#[derive(Accounts)]
pub struct OrderInit<'info> {
    #[account(init, payer=buisness, space=OrderInfo::LEN)]
    pub order_info: Account<'info, OrderInfo>,
    pub influencer_info: Account<'info, InfluencerInfo>,
    pub influencer_program: Program<'info, B4b>,
    #[account(mut)]
    pub buisness: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OrderBooking<'info> {
    #[account(mut)]
    pub order_info: Account<'info, OrderInfo>,
    #[account(mut)]
    pub buisness: Signer<'info>,
    pub system_program: Program<'info, System>,
} 

#[account]
pub struct OrderInfo {
    // pub influencer_info: Account<'info, InfluencerInfo>,
    pub influencer_info_address: Pubkey,
    pub influencer: Pubkey,
    pub cost: u64,
    // pub influencer_info: InfluencerInfo,
    pub buisness: Pubkey,
    pub booked: bool,
    // pub point: i64,
}


const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const COST_LENGTH: usize = 8;
const BOOKED_LENGTH: usize = 2;

impl OrderInfo {
    const LEN: usize =  PUBLIC_KEY_LENGTH 
    + COST_LENGTH
    + PUBLIC_KEY_LENGTH
    + PUBLIC_KEY_LENGTH
    + BOOKED_LENGTH
    + DISCRIMINATOR_LENGTH;
}