import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { MPL_TOKEN_METADATA_PROGRAM_ID, findMasterEditionPda, findMetadataPda, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { publicKey } from "@metaplex-foundation/umi";

describe("solana-nft-anchor", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaNftAnchor as Program<SolanaNftAnchor>;

  const signer = provider.wallet;

  const umi = createUmi("https://api.devnet.solana.com")
  .use(walletAdapterIdentity(signer))
  .use(mplTokenMetadata());


  const mint = anchor.web3.Keypair.generate();
  
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    signer.publicKey
  );

  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey)
  })[0]


  const metadata = {
    name: "Calpytus Course",
    symbol: "CALYPTUS",
    uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
  }

  it("mints nft!", async()=>{

    const tx = await program.methods
    .initNft(metadata.name, metadata.symbol, metadata.uri)
    .accounts({
      signer: signer.publicKey,
      mint: mint.publicKey,
      associatedTokenAccount,
      metadataAccount,
      masterEditionAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([mint])
    .rpc();

    console.log(`Mint transaction on Xray: https://xray.helius.xyz/tx/${tx}?network=devnet`);

    console.log(`Minted NFT on Xray: https://xray.helius.xyz/token/${mint.publicKey}?network=devnet`)

  })


});
