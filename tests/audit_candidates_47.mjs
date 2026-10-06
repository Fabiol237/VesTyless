import { runIndustrialPipeline, CandidateSpecificationPool } from '../src/lib/component-registry/patternDecisionEngine.js';
import { MEDIA_POSITIONS, CONTENT_FLOWS } from '../src/lib/component-registry/structuralPatternModel.js';
const M=MEDIA_POSITIONS, C=CONTENT_FLOWS;
const obs=[
  {siteId:'books',type:'HEADER',variant:'horizontal_bar',hierarchy:['logo','brand_name'],mediaPosition:M.LEFT,contentFlow:C.LINEAR,interactionModel:['navigation','logo_click'],responsiveBehavior:{mobile:'compact_bar',desktop:'expanded_bar'},dataRequirements:['name','logo']},
  {siteId:'books',type:'HERO',variant:'gradient_banner',hierarchy:['title','subtitle'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['direct_cta'],responsiveBehavior:{mobile:'card_stack',desktop:'wide_card'},dataRequirements:['title','description']},
  {siteId:'books',type:'PRODUCT',variant:'grid_2col',hierarchy:['title','product_cards'],mediaPosition:M.TOP,contentFlow:C.GRID,interactionModel:['add_to_cart','quick_order'],responsiveBehavior:{mobile:'grid_2col',desktop:'grid_4col'},dataRequirements:['products']},
  {siteId:'books',type:'CATEGORY',variant:'pill_row',hierarchy:['title','category_pills'],mediaPosition:M.NONE,contentFlow:C.SCROLLABLE_ROW,interactionModel:['category_select'],responsiveBehavior:{mobile:'scrollable',desktop:'wrap_pills'},dataRequirements:['categories']},
  {siteId:'books',type:'FOOTER',variant:'minimal_footer',hierarchy:['legal_text','social_links'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['legal_navigation'],responsiveBehavior:{mobile:'stack',desktop:'columns'},dataRequirements:['name']},
  {siteId:'ruby',type:'HEADER',variant:'horizontal_bar',hierarchy:['logo','brand_name','status_city'],mediaPosition:M.LEFT,contentFlow:C.LINEAR,interactionModel:['navigation','logo_click'],responsiveBehavior:{mobile:'compact_bar',desktop:'expanded_bar'},dataRequirements:['name','logo']},
  {siteId:'ruby',type:'HERO',variant:'gradient_banner',hierarchy:['title','lead_paragraph'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['direct_cta'],responsiveBehavior:{mobile:'card_stack',desktop:'wide_card'},dataRequirements:['title','description']},
  {siteId:'ruby',type:'SERVICE',variant:'list_cards',hierarchy:['service_rows'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['book_service'],responsiveBehavior:{mobile:'stack',desktop:'stack'},dataRequirements:['services']},
  {siteId:'ruby',type:'FOOTER',variant:'multi_column_legal',hierarchy:['brand_info','navigation_columns','legal_notices'],mediaPosition:M.NONE,contentFlow:C.GRID,interactionModel:['navigation','external_links'],responsiveBehavior:{mobile:'stack',desktop:'grid_4col'},dataRequirements:['name','address','phone']},
  {siteId:'python',type:'HEADER',variant:'horizontal_bar',hierarchy:['logo','brand_name'],mediaPosition:M.LEFT,contentFlow:C.LINEAR,interactionModel:['navigation','search'],responsiveBehavior:{mobile:'compact_bar',desktop:'expanded_bar'},dataRequirements:['name','logo']},
  {siteId:'python',type:'HERO',variant:'gradient_banner',hierarchy:['title','subtitle','cta_button'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['direct_cta'],responsiveBehavior:{mobile:'card_stack',desktop:'wide_card'},dataRequirements:['title','description']},
  {siteId:'python',type:'FOOTER',variant:'multi_column_legal',hierarchy:['brand_info','navigation_columns','legal_notices'],mediaPosition:M.NONE,contentFlow:C.GRID,interactionModel:['navigation','external_links'],responsiveBehavior:{mobile:'stack',desktop:'grid_4col'},dataRequirements:['name','address','phone']},
  {siteId:'eff',type:'HEADER',variant:'horizontal_bar',hierarchy:['logo','brand_name'],mediaPosition:M.LEFT,contentFlow:C.LINEAR,interactionModel:['navigation','logo_click'],responsiveBehavior:{mobile:'compact_bar',desktop:'expanded_bar'},dataRequirements:['name','logo']},
  {siteId:'eff',type:'HERO',variant:'fullscreen_cover',hierarchy:['badge','title','subtitle','cta_button'],mediaPosition:M.BACKGROUND,contentFlow:C.LINEAR,interactionModel:['direct_cta'],responsiveBehavior:{mobile:'tall_card',desktop:'fullscreen_banner'},dataRequirements:['banner','title']},
  {siteId:'eff',type:'FOOTER',variant:'multi_column_legal',hierarchy:['brand_info','navigation_columns','legal_notices'],mediaPosition:M.NONE,contentFlow:C.GRID,interactionModel:['navigation','external_links'],responsiveBehavior:{mobile:'stack',desktop:'grid_4col'},dataRequirements:['name','address','phone']},
  {siteId:'postgres',type:'HEADER',variant:'horizontal_bar',hierarchy:['logo','brand_name'],mediaPosition:M.LEFT,contentFlow:C.LINEAR,interactionModel:['navigation'],responsiveBehavior:{mobile:'compact_bar',desktop:'expanded_bar'},dataRequirements:['name','logo']},
  {siteId:'postgres',type:'HERO',variant:'gradient_banner',hierarchy:['title','subtitle'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['direct_cta'],responsiveBehavior:{mobile:'card_stack',desktop:'wide_card'},dataRequirements:['title','description']},
  {siteId:'postgres',type:'SERVICE',variant:'list_cards',hierarchy:['service_rows'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['book_service'],responsiveBehavior:{mobile:'stack',desktop:'stack'},dataRequirements:['services']},
  {siteId:'postgres',type:'FOOTER',variant:'minimal_footer',hierarchy:['legal_text','social_links'],mediaPosition:M.NONE,contentFlow:C.LINEAR,interactionModel:['legal_navigation'],responsiveBehavior:{mobile:'stack',desktop:'columns'},dataRequirements:['name']},
];
const pool=new CandidateSpecificationPool();
const r=runIndustrialPipeline(obs,null,{pool,clearPool:true});
console.log('OBSERVATIONS:',r.observationsInput,'CLUSTERS:',r.patternClustersCount,'CANDIDATES:',r.candidateSpecificationsCount);
console.log('DECISIONS:',JSON.stringify(r.decisions));
if(r.candidateSpecificationsCount>0){
  for(const s of r.candidateSpecifications){
    console.log('CANDIDATE:',s.candidateId,'family:',s.family,'closest:',s.closestCanonical);
    console.log('  diffs:',s.structuralDifferences.join('; '));
  }
}
for(const cr of r.clusterReports){
  console.log(`[${cr.decision}] ${cr.family} occ=${cr.occurrences}`);
}
