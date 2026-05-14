import { pipeline, env } from '@xenova/transformers';

let extractor = null;
let loading = false;

export const getAIExtractor = async (progress_callback = null) => {
  if (extractor) return extractor;
  if (loading) {
    // Wait for existing loading to finish
    while (loading) {
      await new Promise(res => setTimeout(res, 100));
    }
    return extractor;
  }

  loading = true;
  try {
    env.allowLocalModels = false;
    extractor = await pipeline(
      'image-feature-extraction',
      'Xenova/clip-vit-base-patch32',
      { progress_callback }
    );
    return extractor;
  } finally {
    loading = false;
  }
};
