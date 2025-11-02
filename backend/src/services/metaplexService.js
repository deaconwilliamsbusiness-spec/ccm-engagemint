/**
 * SIMPLIFIED Metaplex Service - Production Ready
 *
 * Core functionality only: Upload image + create metadata
 */

const {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} = require('@metaplex-foundation/js');
const { Connection } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

let metaplex = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeMetaplex(platformWallet) {
  const connection = new Connection(RPC_URL, 'confirmed');

  metaplex = Metaplex.make(connection)
    .use(keypairIdentity(platformWallet))
    .use(
      bundlrStorage({
        address:
          SOLANA_NETWORK === 'mainnet-beta'
            ? 'https://node1.bundlr.network'
            : 'https://devnet.bundlr.network',
        providerUrl: RPC_URL,
        timeout: 60000,
      })
    );

  logger.info('✅ Metaplex initialized');
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Create token metadata from video
 * This is the main function used by the API
 */
async function createTokenMetadataFromVideo({
  videoId,
  thumbnailPath,
  name,
  symbol,
  description,
  externalLinks = {},
}) {
  try {
    logger.info(`Creating metadata for ${symbol}...`);

    if (!metaplex) {
      throw new Error('Metaplex not initialized');
    }

    if (!thumbnailPath || !fs.existsSync(thumbnailPath)) {
      logger.warn('No thumbnail found, using default');
      thumbnailPath = path.join(__dirname, '../assets/default-token.png');
    }

    // Upload image
    const imageUri = await uploadImage(thumbnailPath);
    logger.info(`Image uploaded: ${imageUri}`);

    // Create metadata JSON
    const metadata = {
      name,
      symbol,
      description,
      image: imageUri,
      external_url: externalLinks.website || '',
      attributes: [
        { trait_type: 'Type', value: 'Memecoin' },
        { trait_type: 'Launchpad', value: 'EngageMint' },
        { trait_type: 'Video ID', value: videoId },
      ],
      properties: {
        category: 'fungible-token',
        files: [{ uri: imageUri, type: getMimeType(thumbnailPath) }],
      },
    };

    // Add social links if provided
    if (externalLinks.twitter) metadata.twitter = externalLinks.twitter;
    if (externalLinks.telegram) metadata.telegram = externalLinks.telegram;
    if (externalLinks.website) metadata.website = externalLinks.website;

    // Upload metadata JSON
    const metadataUri = await metaplex.storage().uploadJson(metadata);
    logger.info(`✅ Metadata created: ${metadataUri}`);

    return metadataUri;
  } catch (error) {
    logger.error('Failed to create metadata:', error);
    throw error;
  }
}

/**
 * Upload image file to Arweave/IPFS
 */
async function uploadImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    const buffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const mimeType = getMimeType(imagePath);

    const file = toMetaplexFile(buffer, fileName, { contentType: mimeType });
    const imageUri = await metaplex.storage().upload(file);

    return imageUri;
  } catch (error) {
    logger.error('Failed to upload image:', error);
    throw error;
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return types[ext] || 'image/jpeg';
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  initializeMetaplex,
  createTokenMetadataFromVideo,
  uploadImage,
};
